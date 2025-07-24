/* eslint-disable sort-keys */
import path from 'node:path';

import pino from 'pino';
import { pinoLoki } from 'pino-loki';
import pinoPretty from 'pino-pretty';
import { createStream } from 'rotating-file-stream';

/**
 * create pretty stream entry
 */
export function createPrettyStreamEntry(
  _app: string,
  level: pino.Level,
): pino.StreamEntry {
  const stream = pinoPretty({
    translateTime: false,
    hideObject: false,
    colorize: true,
  });

  return { level, stream };
}

/**
 * create loki stream entry
 * https://github.com/pinojs/pino/blob/master/docs/transports.md#pino-loki
 */
export function createLokiStreamEntry(
  app: string,
  level: pino.Level,
  host: string,
): pino.StreamEntry {
  const stream = pinoLoki({
    replaceTimestamp: true,
    batching: true,
    interval: 5,
    host, // Change if Loki hostname is different
    labels: { app },
  });

  return { level, stream };
}

/**
 * create file stream entry
 * https://github.com/iccicci/rotating-file-stream?tab=readme-ov-file#initialrotation
 */
export function createFileStreamEntry(
  _app: string,
  level: pino.Level,
  filepath: string,
): pino.StreamEntry {
  const { base, dir } = path.parse(filepath);

  const stream = createStream(base, {
    size: '1G', // 1G rotate every 1 Gigabyte written
    interval: '1d', // rotate daily
    compress: 'gzip', // compress rotated files
    path: dir,
  });

  return { level, stream };
}

/**
 * add multi destination stream
 * support pretty, file, loki
 */
export function getMultiDestinationStream(
  app: string,
  level: pino.Level = 'info',
  filepath?: string,
  loki?: string,
): pino.MultiStreamRes {
  const entries: pino.StreamEntry[] = [createPrettyStreamEntry(app, level)];

  if (filepath) entries.push(createFileStreamEntry(app, level, filepath));
  if (loki) entries.push(createLokiStreamEntry(app, level, loki));

  return pino.multistream(entries);
}
