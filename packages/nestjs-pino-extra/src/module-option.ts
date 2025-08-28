/* eslint-disable sort-keys */
import type { ConfigService } from '@nestjs/config';
import type { Params } from 'nestjs-pino';
import type { Level } from 'pino';

import {
  getMultiDestinationStream,
  getPinoHttpOption,
  type LokiOptions,
} from '@nestjs-labs/pino-http-extra';

/**
 * Configuration interface for better type safety
 */
export interface LogConfig {
  app: string;
  filename?: string;
  level: Level;
  loki?: LokiOptions;
  spanIdKey: string;
  traceIdKey: string;
}

/**
 * Get Loki options from ConfigService
 * @param configService - ConfigService
 * @returns LokiOptions | undefined
 */
export function getLokiOptions(
  configService: ConfigService,
): LokiOptions | undefined {
  const host = configService.get<string>('LOG_LOKI_HOST');
  const username = configService.get<string>('LOG_LOKI_USERNAME');
  const password = configService.get<string>('LOG_LOKI_PASSWORD');
  const labels = configService
    .get<string>('LOG_LOKI_LABELS')
    ?.split(',')
    .reduce(
      (acc, label) => {
        const [key, value] = label.split('=');

        acc[key] = value;

        return acc;
      },
      {} as Record<string, string>,
    );

  return host
    ? {
        host,
        basicAuth: username && password ? { username, password } : undefined,
        labels,
      }
    : undefined;
}

/**
 * Get OpenTelemetry options from ConfigService
 * @param configService - ConfigService
 * @returns { spanIdKey: string; traceIdKey: string }
 */
export function getOtelOptions(configService: ConfigService): {
  spanIdKey: string;
  traceIdKey: string;
} {
  const spanIdKey = configService.get<string>('OTEL_SPAN_ID_KEY') ?? 'spanId';
  const traceIdKey =
    configService.get<string>('OTEL_TRACE_ID_KEY') ?? 'traceId';

  return { spanIdKey, traceIdKey };
}

/**
 * Extract and validate log configuration from ConfigService
 */
export function extractLogConfig(configService: ConfigService): LogConfig {
  const app = configService.get<string>('OTLP_SERVICE_NAME') ?? 'app';
  const level = configService.get<Level>('LOG_LEVEL') ?? 'info';
  const filename = configService.get<string>('LOG_FILE');

  const lokiOptions = getLokiOptions(configService);
  const otelOptions = getOtelOptions(configService);

  // Validate log level
  const validLevels: Level[] = [
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace',
  ];

  if (!validLevels.includes(level)) {
    throw new Error(
      `Invalid LOG_LEVEL: ${level}. Must be one of: ${validLevels.join(', ')}`,
    );
  }

  return {
    app,
    filename,
    level,
    loki: lokiOptions,
    spanIdKey: otelOptions.spanIdKey,
    traceIdKey: otelOptions.traceIdKey,
  };
}

export function getPinoHttpFromConfig(config: LogConfig): Params['pinoHttp'] {
  return [
    getPinoHttpOption(config.level, config.spanIdKey, config.traceIdKey),
    getMultiDestinationStream(
      config.app,
      config.level,
      config.filename,
      config.loki,
    ),
  ];
}

/**
 * Get nestjs-pino module options from config
 * @param config - LogConfig
 * @param overrides - Overrides for the module options
 * @returns NestjsPinoModuleOptions
 */
export function getParamsFromConfig(
  config: LogConfig,
  overrides?: Params,
): Params {
  const pinoHttp = getPinoHttpFromConfig(config);
  const params: Params = {
    pinoHttp,
    exclude: [{ method: 0, path: '/health' }],
  };

  return Object.assign(params, overrides);
}

/**
 * Get nestjs-pino module options with improved type safety and validation
 * @param configService - ConfigService
 * @param overrides - Overrides for the module options
 * @returns NestjsPinoModuleOptions
 * @example
 * ```ts
 * const options = getNestjsPinoModuleOptions(configService, {
 *   exclude: [{ method: 0, path: '/health' }],
 * });
 * ```
 * or you can use the config service directly
 * ```ts
 * // const config = you can get it from the config service or from the environment variables
 * getParamsFromConfig(config)
 * ```
 */
export function getNestjsPinoModuleOptions(
  configService: ConfigService,
  overrides: Params = {},
): Params {
  const config = extractLogConfig(configService);

  return getParamsFromConfig(config, overrides);
}
