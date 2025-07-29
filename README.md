# NestJS Pino Extra

Enhanced logging solutions for NestJS applications with OpenTelemetry integration, file rotation, Loki support, and enterprise features.

[![npm version](https://img.shields.io/npm/v/@nestjs-labs/nestjs-pino-extra.svg)](https://www.npmjs.com/package/@nestjs-labs/nestjs-pino-extra)
[![License](https://img.shields.io/npm/l/@nestjs-labs/nestjs-pino-extra.svg)](https://github.com/nestjs-labs/nestjs-pino-extra/blob/main/LICENSE)

## Packages

This monorepo contains two main packages:

### 📦 @nestjs-labs/nestjs-pino-extra

Enhanced NestJS Pino module with OpenTelemetry integration, file rotation, and Loki support.

**Features:**
- 🔍 OpenTelemetry integration with automatic span/trace ID injection
- 📊 Loki transport for centralized logging
- 📁 File rotation with compression
- 🎨 Pretty logging for development
- 🔒 Automatic redaction of sensitive fields
- ⚡ High-performance logging with Pino

**[📖 Full Documentation](packages/nestjs-pino-extra/README.md)** | **[📦 NPM Package](https://www.npmjs.com/package/@nestjs-labs/nestjs-pino-extra)**

### 📦 @nestjs-labs/pino-http-extra

Enhanced pino-http with OpenTelemetry, Loki, file rotation and enterprise features.

**Features:**
- 🔍 OpenTelemetry integration
- 📊 Loki transport
- 📁 File rotation with compression
- 🎨 Pretty console output
- 🔒 Security with automatic redaction
- ⚡ High-performance logging
- 🆔 Request ID generation and tracking
- 📈 Response time tracking

**[📖 Full Documentation](packages/pino-http-extra/README.md)** | **[📦 NPM Package](https://www.npmjs.com/package/@nestjs-labs/pino-http-extra)**

## Quick Installation

### For NestJS Applications

```bash
pnpm install @nestjs-labs/nestjs-pino-extra nestjs-pino @nestjs-labs/pino-http-extra @nestjs/config --save
```

### For Express/Fastify Applications

```bash
npm install @nestjs-labs/pino-http-extra
```

## Quick Start

### NestJS Integration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@nestjs-labs/nestjs-pino-extra';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => 
        getNestjsPinoModuleOptions(configService),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Express Integration

```typescript
import express from 'express';
import pinoHttp from 'pino-http';
import { getPinoHttpOption, getMultiDestinationStream } from '@nestjs-labs/pino-http-extra';

const app = express();
const pinoHttpLogger = pinoHttp(getPinoHttpOption());
app.use(pinoHttpLogger);
```

## Environment Variables

```bash
# Required
OTLP_SERVICE_NAME=my-app

# Optional
LOG_LEVEL=info
LOG_FILE=/var/log/app.log
LOG_LOKI=http://loki:3100
OTEL_SPAN_ID_KEY=spanId
OTEL_TRACE_ID_KEY=traceId
```

## Development

```bash
# Install dependencies
pnpm install

# Build packages
pnpm run build

# Lint
pnpm run lint
```

## License

MIT

## Support

- 📖 [Documentation](https://nestjs-labs.github.io/nestjs-pino-extra)
- 🐛 [Issues](https://github.com/nestjs-labs/nestjs-pino-extra/issues)
- 💬 [Discussions](https://github.com/nestjs-labs/nestjs-pino-extra/discussions)
