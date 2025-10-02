import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health-indicator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
  ) {}

  @Get('live')
  liveness() {
    this.logger.debug('Liveness probe invoked');
    return { status: 'ok' };
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    this.logger.debug('Readiness probe invoked');
    return this.health.check([
      () => this.prismaIndicator.pingCheck('database'),
    ]);
  }
}
