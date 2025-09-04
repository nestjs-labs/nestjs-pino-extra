/* eslint-disable sort-keys */
import type { SerializerFn } from 'pino';
import type { SerializedError, SerializedRequest, SerializedResponse } from 'pino-std-serializers';

/**
 * get serializers
 * https://github.com/pinojs/pino-http?tab=readme-ov-file#custom-serializers--custom-log-attribute-keys
 */
export function getSerializers(): Record<string, SerializerFn> {
  return {
    req(req: SerializedRequest) {
      const request = req.raw as unknown as Request & {
        query: Record<string, unknown>;
      };

      return {
        id: req.id,
        method: req.method,
        url: req.url,
        headers: request.headers,
        query: request.query,
        body: request.body,
      };
    },
    res(response: SerializedResponse) {
      const { statusCode: status, ...serialized } = response;

      return Object.assign({ status }, serialized);
    },
    err(err: SerializedError) {
      return err;
    },
  };
}
