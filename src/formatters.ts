import { context, trace } from '@opentelemetry/api';

/**
 * add custom formatters
 * https://github.com/pinojs/pino-http?tab=readme-ov-file#custom-formatters
 */
export function getOtelFormatters(
  spanIdKey: string = 'spanId',
  traceIdKey: string = 'traceId',
) {
  return {
    level: (label: string) => {
      return { level: label };
    },
    // Workaround for PinoInstrumentation (does not support latest version yet)
    log(object: Record<string, unknown>) {
      const span = trace.getSpan(context.active());
      if (!span) return object;
      const spanContext = trace.getSpan(context.active())?.spanContext();
      if (!spanContext) return object;

      const { spanId, traceId } = spanContext;
      return { ...object, [spanIdKey]: spanId, [traceIdKey]: traceId };
    },
  };
}
