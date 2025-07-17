# NestJS Pino Extra

Enhanced nestjs-pino with OpenTelemetry integration, file rotation, Loki support, and enterprise features for production-ready logging.

## Features

- 🚀 **Easy Integration**: Simple setup with NestJS Pino
- 📊 **OpenTelemetry Support**: Automatic trace and span ID injection
- 📁 **File Rotation**: Configurable log file rotation with compression
- 🔍 **Loki Integration**: Direct logging to Grafana Loki
- 🎨 **Pretty Logging**: Development-friendly colored output
- 🔒 **Security**: Automatic redaction of sensitive fields
- 🏷️ **Request ID**: Automatic request ID generation and tracking
- 📈 **Smart Log Levels**: Automatic log level based on HTTP status codes

## Installation

```bash
npm install @nestjs-labs/nestjs-pino-extra
# or
yarn add @nestjs-labs/nestjs-pino-extra
# or
pnpm add @nestjs-labs/nestjs-pino-extra
```

## Quick Start

### 1. Import the Module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  LoggerModule,
  getLoggerModuleOptions,
} from '@nestjs-labs/nestjs-pino-extra';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getLoggerModuleOptions(configService),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 2. Configure Environment Variables

```env
# Required
OTLP_SERVICE_NAME=my-app

# Optional
LOG_LEVEL=info
LOG_FILE=/var/log/app.log
LOG_LOKI=http://localhost:3100
```

## Configuration Options

### Environment Variables

| Variable            | Default   | Description                                 |
| ------------------- | --------- | ------------------------------------------- |
| `OTLP_SERVICE_NAME` | `app`     | Application name for log labels             |
| `LOG_LEVEL`         | `info`    | Log level (error, warn, info, debug, trace) |
| `LOG_FILE`          | -         | File path for log rotation (optional)       |
| `LOG_LOKI`          | -         | Loki server URL (optional)                  |
| `OTEL_SPAN_ID_KEY`  | `spanId`  | Key for OpenTelemetry span ID in logs       |
| `OTEL_TRACE_ID_KEY` | `traceId` | Key for OpenTelemetry trace ID in logs      |

### Features

#### OpenTelemetry Integration

Automatically injects trace and span IDs into logs when using OpenTelemetry:

```typescript
import { trace, context } from '@opentelemetry/api';

// Your logs will automatically include:
// {
//   "level": "info",
//   "message": "Request processed",
//   "spanId": "abc123",
//   "traceId": "def456",
// }
```

#### File Rotation

Configure log file rotation with automatic compression:

```env
LOG_FILE=/var/log/app.log
```

This creates:

- Rotated files: `app.log.1.gz`, `app.log.2.gz`, etc.
- 1GB file size limit
- Daily rotation
- Gzip compression

#### Loki Integration

Send logs directly to Grafana Loki:

```env
LOG_LOKI=http://localhost:3100
```

#### Request ID Tracking

Automatic request ID generation and header injection:

```typescript
// Request headers will include:
// X-Request-Id: 550e8400-e29b-41d4-a716-446655440000
```

#### Smart Log Levels

Automatic log level based on HTTP status codes:

- `4xx` responses → `warn` level
- `5xx` responses → `error` level
- `3xx` responses → `silent` (no logging)
- `2xx` responses → `info` level

#### Security Features

Automatic redaction of sensitive fields:

```typescript
// These fields are automatically redacted:
// - password
// - reqBody.password
// - user.password
// - reqBody.user.password
```

## Advanced Usage

### Custom Configuration

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from '@nestjs-labs/nestjs-pino-extra';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: [
        {
          level: 'info',
          customLogLevel: (req, res, err) => {
            if (res.statusCode >= 400) return 'warn';
            if (res.statusCode >= 500) return 'error';
            return 'info';
          },
          redact: {
            paths: ['password', 'token', 'secret'],
          },
        },
        // Your custom stream configuration
      ],
      exclude: [
        { method: RequestMethod.GET, path: '/health' },
        { method: RequestMethod.GET, path: '/metrics' },
      ],
    }),
  ],
})
export class AppModule {}
```

### Using the Logger in Services

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async createUser(userData: any) {
    this.logger.log('Creating new user', { userId: userData.id });

    try {
      // Your logic here
      this.logger.log('User created successfully');
    } catch (error) {
      this.logger.error('Failed to create user', error.stack);
      throw error;
    }
  }
}
```

## Development

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
npm run lint:fix
```

## Dependencies

- `@nestjs/common` - NestJS core
- `@nestjs/config` - Configuration management
- `@opentelemetry/api` - OpenTelemetry integration
- `pino` - Fast Node.js logger
- `pino-http` - HTTP request logging
- `pino-loki` - Loki transport
- `pino-pretty` - Pretty printing
- `rotating-file-stream` - File rotation

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- 📖 [Documentation](https://github.com/nestjs-labs/nestjs-pino-extra)
- 🐛 [Issues](https://github.com/nestjs-labs/nestjs-pino-extra/issues)
- 💬 [Discussions](https://github.com/nestjs-labs/nestjs-pino-extra/discussions)
