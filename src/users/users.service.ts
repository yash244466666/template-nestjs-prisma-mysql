import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<UserEntity> {
    this.logger.log(`Creating user with email: ${dto.email}`);

    try {
      const passwordHash = await bcrypt.hash(dto.password, 12);

      const user: User = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName ?? null,
          lastName: dto.lastName ?? null,
          passwordHash,
        },
      });

      this.logger.log(`User created with ID: ${user.id}`);

      return new UserEntity(user);
    } catch (error: unknown) {
      const err = this.toError(error);
      this.logger.error(
        `Failed to create user with email ${dto.email}`,
        err.stack,
      );
      throw err;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<UserEntity[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;

    this.logger.debug(`Fetching users page=${page} limit=${limit}`);

    try {
      const users: User[] = await this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      this.logger.debug(`Fetched ${users.length} users`);

      return users.map((user) => new UserEntity(user));
    } catch (error: unknown) {
      const err = this.toError(error);
      this.logger.error(
        `Failed to fetch users page=${page} limit=${limit}`,
        err.stack,
      );
      throw err;
    }
  }

  async findOne(id: number): Promise<UserEntity> {
    this.logger.debug(`Fetching user with id=${id}`);

    try {
      const user: User | null = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        this.logger.warn(`User not found id=${id}`);
        throw new NotFoundException('User not found');
      }

      return new UserEntity(user);
    } catch (error: unknown) {
      const err = this.toError(error);
      if (err instanceof NotFoundException) {
        throw err;
      }

      this.logger.error(`Failed to fetch user with id=${id}`, err.stack);
      throw err;
    }
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
    this.logger.log(`Updating user id=${id}`);

    const { password, email, firstName, lastName } = dto;
    const payload: Prisma.UserUpdateInput = {};

    if (email !== undefined) {
      payload.email = email;
    }

    if (firstName !== undefined) {
      payload.firstName = firstName;
    }

    if (lastName !== undefined) {
      payload.lastName = lastName;
    }

    try {
      if (password) {
        payload.passwordHash = await bcrypt.hash(password, 12);
      }

      if (Object.keys(payload).length === 0) {
        throw new BadRequestException('No fields provided to update');
      }

      const user: User = await this.prisma.user.update({
        where: { id },
        data: payload,
      });

      this.logger.log(`User id=${id} updated`);

      return new UserEntity(user);
    } catch (error: unknown) {
      const err = this.toError(error);
      if (err instanceof BadRequestException) {
        this.logger.warn(`Failed update for user id=${id}: ${err.message}`);
        throw err;
      }

      this.logger.error(`Failed to update user id=${id}`, err.stack);
      if (this.isRecordNotFoundError(err)) {
        throw new NotFoundException('User not found');
      }
      throw err;
    }
  }

  async remove(id: number): Promise<void> {
    this.logger.warn(`Deleting user id=${id}`);

    try {
      await this.prisma.user.delete({ where: { id } });
      this.logger.log(`User id=${id} deleted`);
    } catch (error: unknown) {
      const err = this.toError(error);
      this.logger.error(`Failed to delete user id=${id}`, err.stack);
      if (this.isRecordNotFoundError(err)) {
        throw new NotFoundException('User not found');
      }
      throw err;
    }
  }

  private toError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    try {
      return new Error(JSON.stringify(error));
    } catch {
      return new Error(String(error));
    }
  }

  private isRecordNotFoundError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    );
  }
}
