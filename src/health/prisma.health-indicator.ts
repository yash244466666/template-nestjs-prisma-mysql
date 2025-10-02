import { Injectable, Logger } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(PrismaHealthIndicator.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.debug(`Health check '${key}' succeeded`);
      return this.getStatus(key, true);
    } catch (error: unknown) {
      const err = this.toError(error);
      this.logger.error(
        `Health check '${key}' failed: ${err.message}`,
        err.stack,
      );
      throw new HealthCheckError('Prisma check failed', err);
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
}
