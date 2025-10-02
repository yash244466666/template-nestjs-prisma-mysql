import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ensureDatabaseExists } from './ensure-database';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PrismaService,
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.getOrThrow<string>('DATABASE_URL');
        const adminDatabaseUrl =
          configService.get<string>('DATABASE_ADMIN_URL');
        await ensureDatabaseExists(databaseUrl, adminDatabaseUrl ?? undefined);
        return new PrismaService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
