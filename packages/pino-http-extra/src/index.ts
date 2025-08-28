/**
 * @nestjs-labs/pino-http-extra
 * Enhanced pino-http with OpenTelemetry, Loki, file rotation and enterprise features
 */

// re-export nestjs-pino module options
export { getOtelFormatters } from './formatters.js';
export { getPinoHttpOption } from './options.js';
export { getSerializers } from './serializers.js';
export {
  createFileStreamEntry,
  createLokiStreamEntry,
  createPrettyStreamEntry,
  getMultiDestinationStream,
} from './streams.js';
export type { LokiOptions } from 'pino-loki';
