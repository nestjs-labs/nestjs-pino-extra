import type { IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'node:crypto';

import pino from 'pino';
import type { Options } from 'pino-http';

import { getOtelFormatters } from './formatters';
import { getSerializers } from './serializers';

/**
 * get pino http option
 */
export function getPinoHttpOption(
  level: string = 'info',
  spanIdKey: string = 'spanId',
  traceIdKey: string = 'traceId',
): Options {
  return {
    // https://getpino.io/#/docs/api?id=timestamp-boolean-function
    // Change time value in production log.
    // timestamp: stdTimeFunctions.isoTime,
    level,
    quietReqLogger: false,
    timestamp: pino.stdTimeFunctions.isoTime,
    customAttributeKeys: {
      req: 'req',
      res: 'res',
      err: 'err',
      responseTime: 'taken(ms)',
    },
    formatters: getOtelFormatters(spanIdKey, traceIdKey),
    serializers: getSerializers(),
    redact: {
      paths: [
        'password',
        'reqBody.password',
        'user.password',
        'reqBody.user.password',
      ],
    },
    genReqId: function (req, res) {
      const reqId = req.id ?? req.headers['x-request-id'];
      if (reqId) return reqId;
      const id = randomUUID();
      res.setHeader('X-Request-Id', id);
      return id;
    },
    // Define a custom logger level
    customLogLevel(
      _: IncomingMessage,
      res: ServerResponse<IncomingMessage>,
      err?: Error,
    ) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return 'silent';
      }

      return 'info';
    },
  };
}
