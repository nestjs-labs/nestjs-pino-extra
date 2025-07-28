# @nestjs-labs/nest-pino-extra

Enhanced nestjs-pino with OpenTelemetry, Loki, file rotation and enterprise features.

## Installation

This package has peer dependencies that must be installed:

```bash
pnpm install @nestjs-labs/nest-pino-extra nestjs-pino @nestjs-labs/pino-http-extra @nestjs/config --save
```

### Peer Dependencies

This package requires the following peer dependencies:

- **@nestjs/config** (^4.0.0): Required for configuration management
- **nestjs-pino** (^4.4.0): Required for NestJS Pino integration  
- **@nestjs-labs/pino-http-extra** (^1.0.0): Required for enhanced pino-http functionality

If any of these dependencies are missing, you'll get runtime errors when trying to use the package. Make sure to install all peer dependencies.

## Features

- 🔍 **OpenTelemetry Integration**: Automatic span and trace ID injection
- 📊 **Loki Transport**: Send logs to Grafana Loki
- 📁 **File Rotation**: Automatic log file rotation with compression
- 🎨 **Pretty Logging**: Colored and formatted console output
- 🔒 **Security**: Automatic redaction of sensitive fields
- ⚡ **Performance**: High-performance logging with Pino

## Quick Start

### Basic Usage

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@nestjs-labs/nest-pino-extra';

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

### Environment Variables

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

### Advanced Configuration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@nestjs-labs/nest-pino-extra';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => 
        getNestjsPinoModuleOptions(configService, {
          exclude: [
            { method: 0, path: '/health' },
            { method: 0, path: '/metrics' },
          ],
        }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## API Reference

### Functions

#### `getNestjsPinoModuleOptions(configService, overrides?)`

Get nestjs-pino module options with improved type safety and validation.

**Parameters:**
- `configService`: ConfigService - NestJS configuration service
- `overrides`: Params (optional) - Overrides for the module options

**Returns:** Params - Configured nestjs-pino module options

#### `getPinoHttpOption(level?, spanIdKey?, traceIdKey?)`

Get pino-http options with OpenTelemetry integration.

**Parameters:**
- `level`: string (default: 'info') - Log level
- `spanIdKey`: string (default: 'spanId') - OpenTelemetry span ID key
- `traceIdKey`: string (default: 'traceId') - OpenTelemetry trace ID key

**Returns:** Options - Configured pino-http options

#### `getMultiDestinationStream(app, level?, filepath?, loki?)`

Create multi-destination stream supporting pretty, file, and Loki outputs.

**Parameters:**
- `app`: string - Application name
- `level`: pino.Level (default: 'info') - Log level
- `filepath`: string (optional) - Log file path for rotation
- `loki`: string (optional) - Loki host URL

**Returns:** MultiStreamRes - Configured multi-stream

## Examples

### Custom Logging

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    this.logger.log('Hello World!');
    return 'Hello World!';
  }
}
```

### HTTP Request Logging

The middleware automatically logs HTTP requests with:
- Request ID generation
- Response time tracking
- Status code-based log levels
- Sensitive data redaction

## License

MIT 