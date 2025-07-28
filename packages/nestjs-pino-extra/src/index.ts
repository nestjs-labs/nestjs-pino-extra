/**
 * @nestjs-labs/nestjs-pino-extra
 * Enhanced nestjs-pino with OpenTelemetry, Loki, file rotation and enterprise features
 */

// Export our own functionality first
export { getNestjsPinoModuleOptions } from './module-option.js';

// Re-export from nestjs-pino (will fail at runtime if not installed)
// This is the expected behavior for peer dependencies
export * from 'nestjs-pino';

// Re-export from pino-http-extra (will fail at runtime if not installed)
// This is the expected behavior for peer dependencies
export * from '@nestjs-labs/pino-http-extra';
