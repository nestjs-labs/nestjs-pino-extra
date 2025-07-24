// reexport nestjs-pino
export * from 'nestjs-pino';

// re-export nestjs-pino module options
export { getOtelFormatters } from './formatters.js';
export { getNestjsPinoModuleOptions } from './module-option.js';
export { getPinoHttpOption } from './options.js';
export { getSerializers } from './serializers.js';
export {
  createFileStreamEntry,
  createLokiStreamEntry,
  createPrettyStreamEntry,
  getMultiDestinationStream,
} from './streams.js';
