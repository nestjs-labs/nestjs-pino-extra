import type { MiddlewareConfigProxy } from '@nestjs/common/interfaces';
import type { ConfigService } from '@nestjs/config';
import type { Params } from 'nestjs-pino';
import pino from 'pino';

import { getPinoHttpOption } from './options';
import { getMultiDestinationStream } from './streams';

/**
 * get nestjs-pino module options
 */
export function getNestjsPinoModuleOptions(
  configService: ConfigService,
  exclude?: Parameters<MiddlewareConfigProxy['exclude']>,
): Params {
  const app = configService.get<string>('OTLP_SERVICE_NAME') ?? 'app';
  const level: string = configService.get('LOG_LEVEL') ?? 'info';
  const filename: string | undefined = configService.get('LOG_FILE');
  const loki: string | undefined = configService.get('LOG_LOKI');
  const spanIdKey: string = configService.get('OTEL_SPAN_ID_KEY') ?? 'spanId';
  const traceIdKey: string =
    configService.get('OTEL_TRACE_ID_KEY') ?? 'traceId';

  return {
    pinoHttp: [
      getPinoHttpOption(level, spanIdKey, traceIdKey),
      getMultiDestinationStream(app, level as pino.Level, filename, loki),
    ],
    // (See https://docs.nestjs.com/middleware#excluding-routes for options)
    exclude,
  };
}
