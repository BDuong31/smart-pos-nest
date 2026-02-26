import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import type { Response } from 'express';
import { responseErr } from '../app-error';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        res.status(statusCode).json({ message: body, statusCode });
      } else {
        res.status(statusCode).json(body);
      }
      return;
    }

    if (exception instanceof Error) {
      responseErr(exception, res);
      return;
    }

    responseErr(new Error('Unknown error'), res);
  }
}
