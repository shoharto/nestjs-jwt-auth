import { Controller, applyDecorators } from '@nestjs/common';
import { API_VERSION } from '../constants/api-versions.constant';
import { ApiTags } from '@nestjs/swagger';

export function ApiVersionController(options: { path: string; tag: string }) {
  return applyDecorators(
    Controller({
      path: options.path,
      version: API_VERSION.V1,
    }),
    ApiTags(options.tag),
  );
}
