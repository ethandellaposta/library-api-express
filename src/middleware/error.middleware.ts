
import { NextFunction, Request, Response } from 'express';

// represents a throwable error
export class HttpException extends Error {
  status: number;
  message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

// handles errors thrown in controller functions
export function error_middleware(error: HttpException, request: Request, response: Response, _next: NextFunction) {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  response
    .status(status)
    .send({
      status,
      message,
    });
}
