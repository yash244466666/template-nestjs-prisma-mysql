import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  email!: string;

  @ApiProperty({ required: false, nullable: true })
  firstName!: string | null;

  @ApiProperty({ required: false, nullable: true })
  lastName!: string | null;

  @Exclude()
  passwordHash!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(partial: User) {
    Object.assign(this, partial);
  }
}
