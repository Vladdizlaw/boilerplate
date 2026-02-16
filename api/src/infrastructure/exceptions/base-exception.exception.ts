import { HttpException, HttpStatus, Logger } from '@nestjs/common';

export class BaseException extends HttpException {
  details?: Record<string, unknown>;
  private logger = new Logger(BaseException.name);

  private constructor(
    message: string,
    status = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: Record<string, unknown>,
  ) {
    super(message, status);
    this.details = details;

    HttpException.captureStackTrace(this, BaseException);
  }

  static fromError(error: Error): BaseException {
    console.log(error);
    // this.logger.error(error.message, error.stack);
    return new BaseException(
      error.message || 'Something went wrong',
      HttpStatus.INTERNAL_SERVER_ERROR,
      {
        details: 'something went wrong',
      },
    );
  }
}
