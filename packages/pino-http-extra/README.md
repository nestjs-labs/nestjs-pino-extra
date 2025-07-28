# @nestjs-labs/pino-http-extra

Enhanced pino-http with OpenTelemetry, Loki, file rotation and enterprise features.

[![npm version](https://img.shields.io/npm/v/@nestjs-labs/pino-http-extra.svg)](https://www.npmjs.com/package/@nestjs-labs/pino-http-extra)
[![License](https://img.shields.io/npm/l/@nestjs-labs/pino-http-extra.svg)](https://github.com/nestjs-labs/nestjs-pino-extra/blob/main/LICENSE)

## 🚀 Features

- 🔍 **OpenTelemetry Integration**: Automatic span and trace ID injection for distributed tracing
- 📊 **Loki Transport**: Send logs to Grafana Loki for centralized log management
- 📁 **File Rotation**: Automatic log file rotation with compression (1GB size, daily rotation)
- 🎨 **Pretty Logging**: Colored and formatted console output for development
- 🔒 **Security**: Automatic redaction of sensitive fields (password, user data)
- ⚡ **Performance**: High-performance logging with Pino
- 🆔 **Request ID**: Automatic request ID generation and tracking
- 📈 **Response Time**: Automatic response time tracking
- 🎯 **Smart Log Levels**: Status code-based log level determination

## 📦 Installation

```bash
npm install @nestjs-labs/pino-http-extra
```

## 🏃‍♂️ Quick Start

### Basic Setup

```typescript
import pino from 'pino'
import pinoHttp from 'pino-http'
import { getPinoHttpOption, getMultiDestinationStream } from '@nestjs-labs/pino-http-extra'
import "dotenv/config"

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
const multiStream = getMultiDestinationStream(app, 'info', 'logs/app.log', 'http://loki:3100')
const pinoHttpOption = getPinoHttpOption()
const pinoHttpLogger = pinoHttp(pinoHttpOption)
const logger = pino(pinoHttpOption, multiStream)

// Use as middleware
app.use(pinoHttpLogger)

app.get('/', (req, res) => {
  req.log.info('Hello from pino-http-extra!')
  res.json({ message: 'Hello World!' })
})

app.listen(3000, () => {
  logger.info('Server running on port 3000')
})
```

### Fastify Integration

```typescript
import Fastify from 'fastify'
import { getPinoHttpOption, getMultiDestinationStream } from '@nestjs-labs/pino-http-extra'

const fastify = Fastify({
  logger: getPinoHttpOption()
})

fastify.get('/', async (request, reply) => {
  request.log.info('Hello from pino-http-extra!')
  return { message: 'Hello World!' }
})

fastify.listen({ port: 3000 })
```

### Advanced Configuration

```typescript
import { getPinoHttpOption, getMultiDestinationStream } from '@nestjs-labs/pino-http-extra'

// Custom OpenTelemetry keys
const options = getPinoHttpOption('debug', 'customSpanId', 'customTraceId')

// Multi-destination with custom settings
const multiStream = getMultiDestinationStream(
  'my-app',           // app name
  'info',             // log level
  '/var/log/app.log', // file path (optional)
  'http://loki:3100'  // loki host (optional)
)
```

## 📚 API Reference

### Core Functions

#### `getPinoHttpOption(level?, spanIdKey?, traceIdKey?)`

Get pino-http options with OpenTelemetry integration and security features.

**Parameters:**
- `level`: `string` (default: `'info'`) - Log level
- `spanIdKey`: `string` (default: `'spanId'`) - OpenTelemetry span ID key
- `traceIdKey`: `string` (default: `'traceId'`) - OpenTelemetry trace ID key

**Returns:** `Options` - Configured pino-http options

**Features:**
- Automatic request ID generation
- Response time tracking
- Status code-based log levels
- Sensitive data redaction
- OpenTelemetry integration

#### `getMultiDestinationStream(app, level?, filepath?, loki?)`

Create multi-destination stream supporting pretty, file, and Loki outputs.

**Parameters:**
- `app`: `string` - Application name for Loki labels
- `level`: `pino.Level` (default: `'info'`) - Log level
- `filepath`: `string` (optional) - Log file path for rotation
- `loki`: `string` (optional) - Loki host URL

**Returns:** `MultiStreamRes` - Configured multi-stream

**Features:**
- Pretty console output with colors
- File rotation (1GB size, daily rotation, gzip compression)
- Loki transport with batching

### Stream Functions

#### `createPrettyStreamEntry(app, level)`

Create pretty console stream entry.

#### `createFileStreamEntry(app, level, filepath)`

Create file rotation stream entry.

#### `createLokiStreamEntry(app, level, host)`

Create Loki transport stream entry.

### Formatters

#### `getOtelFormatters(spanIdKey?, traceIdKey?)`

Get OpenTelemetry formatters for automatic span and trace ID injection.

### Serializers

#### `getSerializers()`

Get enhanced serializers for request/response objects.

## 🔧 Examples

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

## 🔒 Security Features

- **Automatic Redaction**: Sensitive fields are automatically redacted
- **Request ID Tracking**: Each request gets a unique ID for tracing
- **No Sensitive Data**: Passwords and user credentials are never logged

## 🚀 Performance

- **High Performance**: Built on Pino, one of the fastest Node.js loggers
- **Minimal Overhead**: Optimized for production use
- **Async Logging**: Non-blocking log operations
- **Batching**: Loki transport supports batching for better performance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://nestjs-labs.github.io/nestjs-pino-extra)
- [GitHub Repository](https://github.com/nestjs-labs/nestjs-pino-extra)
- [NPM Package](https://www.npmjs.com/package/@nestjs-labs/pino-http-extra)
- [Issues](https://github.com/nestjs-labs/nestjs-pino-extra/issues) 