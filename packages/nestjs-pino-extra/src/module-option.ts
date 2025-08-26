/* eslint-disable sort-keys */
import type { ConfigService } from '@nestjs/config';
import type { Params } from 'nestjs-pino';
import type { Level } from 'pino';

import { getMultiDestinationStream, getPinoHttpOption } from '@nestjs-labs/pino-http-extra';

/**
 * Configuration interface for better type safety
 */
export interface LogConfig {
	app: string;
	filename?: string;
	level: Level;
	loki?: string;
	spanIdKey: string;
	traceIdKey: string;
}

/**
 * Extract and validate log configuration from ConfigService
 */
export function extractLogConfig(configService: ConfigService): LogConfig {
	const app = configService.get<string>('OTLP_SERVICE_NAME') ?? 'app';
	const level = configService.get<Level>('LOG_LEVEL') ?? 'info';
	const filename = configService.get<string>('LOG_FILE');
	const loki = configService.get<string>('LOG_LOKI');
	const spanIdKey = configService.get<string>('OTEL_SPAN_ID_KEY') ?? 'spanId';
	const traceIdKey =
		configService.get<string>('OTEL_TRACE_ID_KEY') ?? 'traceId';

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
		loki,
		spanIdKey,
		traceIdKey,
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