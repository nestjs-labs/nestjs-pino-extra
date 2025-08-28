# tracing-sdk

A comprehensive OpenTelemetry tracing setup SDK for Node.js applications, specifically designed for NestJS projects. This package provides pre-configured OpenTelemetry instrumentation with support for distributed tracing, metrics collection, and observability.

## Features

- 🚀 **Pre-configured OpenTelemetry SDK** - Ready-to-use tracing setup
- 📊 **Automatic instrumentation** - HTTP, Express, NestJS, PostgreSQL, Redis, and more
- 🔍 **Distributed tracing** - W3C Trace Context and B3 propagation support
- 📈 **Metrics export** - Prometheus metrics endpoint
- 🎯 **OTLP support** - OpenTelemetry Protocol for trace export
- 🛡️ **Graceful shutdown** - Proper cleanup on process termination with HTTP server support
- ⚡ **Performance optimized** - Batch span processing for high-throughput applications
- 🎛️ **Flexible configuration** - Class-based design with customizable options
- 🧪 **Testable** - Easy to mock and test in different environments
- 📝 **Custom logging** - Support for custom logger implementations

## Installation

```bash
npm install tracing-sdk
# or
yarn add tracing-sdk
# or
pnpm add tracing-sdk
```

## Quick Start

### 1. Environment Configuration

Set up your environment variables in a `.env` file:

```env
OTLP_SERVICE_NAME=my-service
OTLP_PROM_PORT=8081
OTLP_PROM_ENDPOINT=/metrics
```

### 2. Basic Usage

```typescript
import { TracingSDK } from '@nestjs-labs/tracing-sdk';

// Create and start the tracing SDK
const otelSDK = new TracingSDK();
await otelSDK.start();

// Your application code here...

// Gracefully shutdown when done
await tracing.shutdown();
```

### 3. Use in NestJS Application

```typescript
// make sure the first line
import { TracingSDK } from '@nestjs-labs/tracing-sdk';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create tracing instance
  const tracing = new TracingSDK({
    serviceName: 'my-nestjs-app',
    enableMetrics: true,
    enableTracing: true,
  });
  
  // Start tracing before creating the NestJS app
  await tracing.start();
  
  // Setup graceful shutdown (doesn't exit process automatically)
  tracing.setupGracefulShutdown();
  
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
```

## Configuration

### TracingSDK Options

| Option                  | Type                | Default                         | Description                          |
| ----------------------- | ------------------- | ------------------------------- | ------------------------------------ |
| `serviceName`           | `string`            | `process.env.OTLP_SERVICE_NAME` | Service name for traces and metrics  |
| `promPort`              | `number`            | `8081`                          | Port for Prometheus metrics endpoint |
| `promEndpoint`          | `string`            | `'/metrics'`                    | Path for Prometheus metrics endpoint |
| `enableMetrics`         | `boolean`           | `true`                          | Enable Prometheus metrics export     |
| `enableTracing`         | `boolean`           | `true`                          | Enable OpenTelemetry tracing         |
| `instrumentations`      | `Instrumentation[]` | `[]`                            | Additional custom instrumentations   |
| `logger`                | `Logger`            | `console`                       | Custom logger implementation         |
| `setupGracefulShutdown` | `boolean`           | `true`                          | Auto-setup graceful shutdown         |

### Environment Variables

| Variable             | Default      | Description                          |
| -------------------- | ------------ | ------------------------------------ |
| `OTLP_SERVICE_NAME`  | `'unknown'`  | Service name for traces and metrics  |
| `OTLP_PROM_PORT`     | `8081`       | Port for Prometheus metrics endpoint |
| `OTLP_PROM_ENDPOINT` | `'/metrics'` | Path for Prometheus metrics endpoint |

### Custom Instrumentations

You can add custom instrumentations to the SDK:

```typescript
import { TracingSDK } from 'tracing-sdk';
import { PrismaInstrumentation } from '@prisma/instrumentation';

// Create tracing SDK with custom instrumentations
const tracing = new TracingSDK({
  serviceName: 'my-service',
  instrumentations: [new PrismaInstrumentation()],
});

await tracing.start();
```

### Advanced Configuration

```typescript
import { TracingSDK } from 'tracing-sdk';

// Create multiple tracing instances with different configs
const productionTracing = new TracingSDK({
  serviceName: 'production-service',
  promPort: 9090,
  enableMetrics: true,
  enableTracing: true,
});

const developmentTracing = new TracingSDK({
  serviceName: 'dev-service',
  promPort: 8081,
  enableMetrics: false, // Disable metrics in dev
  enableTracing: true,
});

// Start both instances
await Promise.all([
  productionTracing.start(),
  developmentTracing.start(),
]);
```

## Supported Instrumentations

The SDK automatically includes the following instrumentations:

- **HTTP/HTTPS** - Network request tracing
- **Express** - Web framework instrumentation
- **NestJS Core** - Framework-specific tracing
- **PostgreSQL** - Database query tracing
- **Redis (ioredis)** - Cache operation tracing
- **Pino** - Logging correlation
- **Node.js Core** - Built-in Node.js modules

## API Reference

### TracingSDK Class

#### Constructor
```typescript
new TracingSDK(options?: TracingSDKOptions)
```

#### Methods

- `start(): Promise<void>` - Start the tracing SDK
- `shutdown(): Promise<void>` - Gracefully shutdown the SDK
- `setupGracefulShutdown(server: Server, signals?: NodeJS.Signals[]): Promise<void>` - Setup graceful shutdown handlers with HTTP server
- `isRunning(): boolean` - Check if the SDK is currently running
- `getSDK(): NodeSDK` - Get the underlying OpenTelemetry NodeSDK instance
- `getConfig(): Required<TracingSDKOptions>` - Get current configuration

### Utility Functions

- `shutdownSDK(server: Server, sdk: NodeSDK, logger?: Logger): Promise<void>` - Shutdown SDK with server cleanup
- `shutdownTracing(server: Server, sdk: NodeSDK, signals?: NodeJS.Signals[], logger?: Logger): Promise<void>` - Setup graceful shutdown handlers

## Metrics and Monitoring

### Prometheus Metrics

The SDK automatically exposes a Prometheus metrics endpoint at `/metrics` (configurable). You can access metrics at:

```
http://localhost:8081/metrics
```

### Trace Export

Traces are exported via OTLP HTTP exporter. Configure your OpenTelemetry Collector or backend to receive traces from your application.

## Propagation

The SDK supports multiple trace context propagation formats:

- **W3C Trace Context** - Standard HTTP headers
- **W3C Baggage** - Custom metadata propagation
- **B3** - Zipkin-style propagation
- **Jaeger** - Jaeger-style propagation

## Best Practices

### 1. Early Initialization

Start the tracing SDK as early as possible in your application lifecycle:

```typescript
// Start tracing before any other operations
const tracing = new TracingSDK();
await tracing.start();
```

### 2. Graceful Shutdown

Always ensure proper shutdown to flush pending traces:

```typescript
// Option 1: Setup graceful shutdown handlers (doesn't exit process automatically)
tracing.setupGracefulShutdown(['SIGTERM', 'SIGINT']);

// Option 2: Setup graceful shutdown handlers that exit the process
tracing.setupGracefulShutdownWithExit(['SIGTERM', 'SIGINT']);

// Option 3: Manual shutdown handling
process.on('SIGTERM', async () => {
  await tracing.shutdown();
  // Your other cleanup logic here
  process.exit(0);
});
```

**Important**: 
- `setupGracefulShutdown()` - Only shuts down the tracing SDK but doesn't exit the process. This allows you to handle other cleanup logic before exiting.
- `setupGracefulShutdownWithExit()` - Shuts down the tracing SDK and then exits the process automatically. Use this for standalone applications.

### 3. Service Naming

Use descriptive service names for better trace organization:

```typescript
const tracing = new TracingSDK({
  serviceName: 'user-service-api',
});
```

### 4. Health Check Exclusion

Health check endpoints are automatically excluded from tracing to reduce noise:

```typescript
// The SDK automatically ignores /health endpoints
'@opentelemetry/instrumentation-express': { 
  enabled: true, 
  ignoreLayers: ['/health'] 
}
```

## [Examples](https://github.com/iamnivekx/nestjs-prisma-api)

## Troubleshooting

### Common Issues

1. **Traces not appearing**: Ensure your OpenTelemetry Collector is properly configured and accessible
2. **Missing instrumentations**: Check that all required dependencies are installed

### Debug Mode

Enable debug logging by setting the `OTEL_LOG_LEVEL` environment variable:

```env
OTEL_LOG_LEVEL=debug
```

### Status Checking

```typescript
const tracing = new TracingSDK();

// Check if running
console.log('Is running:', tracing.isRunning());

// Get current config
console.log('Config:', tracing.getConfig());
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Related Packages

- [nestjs-pino-extra](../nestjs-pino-extra/) - Enhanced Pino logging for NestJS
- [pino-http-extra](../pino-http-extra/) - Enhanced Pino HTTP logging

## Support

For support and questions, please open an issue on the [GitHub repository](https://github.com/nestjs-labs/nestjs-pino-extra/issues).
