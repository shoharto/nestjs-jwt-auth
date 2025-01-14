import { Logger, UnauthorizedException } from '@nestjs/common';

export function handleAuthError(
  logger: Logger,
  error: unknown,
  context: string,
  email?: string,
): never {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';

  logger.error(`${context} error`, {
    error: errorMessage,
    email,
  });

  if (error instanceof UnauthorizedException) {
    throw error;
  }

  throw new UnauthorizedException(errorMessage);
}
