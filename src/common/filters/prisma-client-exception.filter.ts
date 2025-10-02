import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { status, message } = this.mapError(exception);

    this.logger.error(
      `Prisma error caught (code=${exception.code})`,
      exception.stack,
      JSON.stringify(exception.meta ?? {}),
    );

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.meta,
    });
  }

  private mapError(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'Record violates a unique constraint.',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Requested record not found.',
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Database request failed.',
        };
    }
  }
}
