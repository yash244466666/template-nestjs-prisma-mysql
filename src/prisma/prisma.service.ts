import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.getOrThrow<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database');
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting Prisma client');
    await this.$disconnect();
    this.logger.log('Prisma client disconnected');
  }
}
