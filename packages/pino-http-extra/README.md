# @nestjs-labs/pino-http-extra

Enhanced pino-http with OpenTelemetry, Loki, file rotation and enterprise features.

[![npm version](https://img.shields.io/npm/v/@nestjs-labs/pino-http-extra.svg)](https://www.npmjs.com/package/@nestjs-labs/pino-http-extra)
[![License](https://img.shields.io/npm/l/@nestjs-labs/pino-http-extra.svg)](https://github.com/nestjs-labs/nestjs-pino-extra/blob/main/LICENSE)

## Features

- 🔍 **OpenTelemetry Integration**: Automatic span and trace ID injection
- 📊 **Loki Transport**: Send logs to Grafana Loki
- 📁 **File Rotation**: Automatic log file rotation with compression
- 🎨 **Pretty Logging**: Colored and formatted console output
- 🔒 **Security**: Automatic redaction of sensitive fields
- ⚡ **Performance**: High-performance logging with Pino
- 🆔 **Request ID**: Automatic request ID generation and tracking
- 📈 **Response Time**: Automatic response time tracking

## Installation

```bash
npm install @nestjs-labs/pino-http-extra
```

## Quick Start

### Basic Setup

```typescript
import pino from 'pino'
import pinoHttp from 'pino-http'
import { getPinoHttpOption, getMultiDestinationStream } from '@nestjs-labs/pino-http-extra'

const level = process.env.LOG_LEVEL || 'info'
const app = process.env.APP_NAME || 'my-app'
const pinoHttpOption = getPinoHttpOption(level, 'spanId', 'traceId')
const filename = process.env.LOG_FILE || 'logs/app.log'
const loki = process.env.LOKI_HOST
const multiStream = getMultiDestinationStream(app, level as pino.Level, filename, loki)
const pinoHttpLogger = pinoHttp(pinoHttpOption)
const logger = pino(pinoHttpOption, multiStream)
```

### Express.js Integration

```typescript
import express from 'express'
import pinoHttp from 'pino-http'
import { getPinoHttpOption, getMultiDestinationStream } from '@nestjs-labs/pino-http-extra'

const app = express()
const multiStream = getMultiDestinationStream(app, 'info', 'logs/app.log', {
  host: 'http://loki:3100',
  basicAuth: {
    username: 'admin',
    password: 'admin',
  },
  labels: {
    app,
    service: app,
  },
})
const pinoHttpOption = getPinoHttpOption()
const pinoHttpLogger = pinoHttp(pinoHttpOption)

app.use(pinoHttpLogger)

app.get('/', (req, res) => {
  req.log.info('Hello from pino-http-extra!')
  res.json({ message: 'Hello World!' })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

### Fastify Integration

```typescript
import Fastify from 'fastify'
import { getPinoHttpOption } from '@nestjs-labs/pino-http-extra'

const fastify = Fastify({
  logger: getPinoHttpOption()
})

fastify.get('/', async (request, reply) => {
  request.log.info('Hello from pino-http-extra!')
  return { message: 'Hello World!' }
})

fastify.listen({ port: 3000 })
```

## API Reference

### Core Functions

#### `getPinoHttpOption(level?, spanIdKey?, traceIdKey?)`

Get pino-http options with OpenTelemetry integration and security features.

**Parameters:**
- `level`: `string` (default: `'info'`) - Log level
- `spanIdKey`: `string` (default: `'spanId'`) - OpenTelemetry span ID key
- `traceIdKey`: `string` (default: `'traceId'`) - OpenTelemetry trace ID key

**Returns:** `Options` - Configured pino-http options

#### `getMultiDestinationStream(app, level?, filepath?, loki?)`

Create multi-destination stream supporting pretty, file, and Loki outputs.

**Parameters:**
- `app`: `string` - Application name for Loki labels
- `level`: `pino.Level` (default: `'info'`) - Log level
- `filepath`: `string` (optional) - Log file path for rotation
- `loki`: `string` (optional) - Loki host URL

**Returns:** `MultiStreamRes` - Configured multi-stream

## Examples

### Custom Logging

```typescript
import pino from 'pino'
import { getPinoHttpOption } from '@nestjs-labs/pino-http-extra'

const logger = pino(getPinoHttpOption())

logger.info('Application started')
logger.warn('Warning message')
logger.error('Error occurred', { error: new Error('Something went wrong') })
```

### HTTP Request Logging

The middleware automatically logs HTTP requests with:

- **Request ID**: Automatically generated and tracked
- **Response Time**: Automatic timing of request duration
- **Status Code Logging**: 
  - 2xx: `info` level
  - 4xx: `warn` level  
  - 5xx: `error` level
  - 3xx: `silent` level
- **Sensitive Data Redaction**: Automatic redaction of password fields
- **OpenTelemetry Integration**: Automatic span and trace ID injection

### Log Output Example

```json
{
  "level": "info",
  "time": "2024-01-15T10:30:00.000Z",
  "reqId": "550e8400-e29b-41d4-a716-446655440000",
  "spanId": "1234567890abcdef",
  "traceId": "abcdef1234567890",
  "req": {
    "method": "GET",
    "url": "/api/users",
    "headers": {
      "user-agent": "Mozilla/5.0..."
    }
  },
  "res": {
    "statusCode": 200
  },
  "responseTime": 45,
  "msg": "request completed"
}
```

## License

MIT 