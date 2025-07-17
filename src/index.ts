// reexport nestjs-pino
export * from 'nestjs-pino';

// re-export nestjs-pino module options
export { getNestjsPinoModuleOptions } from './module-option';
export { getOtelFormatters } from './formatters';
export { getSerializers } from './serializers';
export { getPinoHttpOption } from './options';
export {
  createPrettyStreamEntry,
  createLokiStreamEntry,
  createFileStreamEntry,
  getMultiDestinationStream,
} from './streams';
