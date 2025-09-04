/**
 * https://www.npmjs.com/package/@opentelemetry/sdk-node
 * https://github.com/open-telemetry/opentelemetry-js#package-version-compatibility
 */
import 'dotenv/config';

import type { Instrumentation } from '@opentelemetry/instrumentation';
import type { Server } from 'http';

import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK, type NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { getSdkInstrumentations } from './instrumentations.js';

export type Logger = Pick<Console, 'log' | 'warn' | 'error'>;

/**
 * TracingSDKOptions
 * @interface TracingSDKOptions
 * @property logger - Logger
 * @property serviceName - Service name
 * @property promPort - Prometheus port
 * @property promEndpoint - Prometheus endpoint
 * @property enableMetrics - Enable metrics
 * @property enableTracing - Enable tracing
 * @property instrumentations - Instrumentations
 * @property setupGracefulShutdown - Setup graceful shutdown
 */
export interface TracingSDKOptions {
  logger?: Logger;
  serviceName?: string;
  promPort?: number;
  promEndpoint?: string;
  enableMetrics?: boolean;
  enableTracing?: boolean;
  instrumentations?: Instrumentation[];
  setupGracefulShutdown?: boolean;
}

const {
  // prometheus endpoint, default: /metrics
  OTLP_PROM_ENDPOINT,
  // prometheus port, default: 8081
  OTLP_PROM_PORT,
  // service name, default: unknown
  OTLP_SERVICE_NAME,
} = process.env;

/**
 * TracingSDK class
 * @class TracingSDK
 * @param options - TracingSDKOptions
 * @returns TracingSDK
 */
export class TracingSDK {
  private isStarted = false;
  private sdk: NodeSDK;
  private options: Required<TracingSDKOptions>;
  private logger?: Logger;

  constructor(options: TracingSDKOptions = {}) {
    this.options = {
      enableMetrics: options.enableMetrics ?? true,
      enableTracing: options.enableTracing ?? true,
      instrumentations: options.instrumentations ?? [],
      logger: options.logger ?? console,
      promEndpoint: options.promEndpoint ?? OTLP_PROM_ENDPOINT ?? '/metrics',
      promPort: options.promPort ?? Number(OTLP_PROM_PORT ?? 8081),
      serviceName: options.serviceName ?? OTLP_SERVICE_NAME ?? 'unknown',
      setupGracefulShutdown: options.setupGracefulShutdown ?? true,
    };

    this.logger = this.options.logger;
    this.sdk = this.createSDK();
  }

  private createSDK(): NodeSDK {
    const config: Partial<NodeSDKConfiguration> = {
      contextManager: new AsyncLocalStorageContextManager(),
      instrumentations: getSdkInstrumentations(this.options.instrumentations),
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: this.options.serviceName,
      }),
      textMapPropagator: new CompositePropagator({
        propagators: [
          new W3CTraceContextPropagator(),
          new W3CBaggagePropagator(),
          new B3Propagator({
            injectEncoding: B3InjectEncoding.MULTI_HEADER,
          }),
        ],
      }),
    };

    // Add metrics if enabled
    if (this.options.enableMetrics) {
      const metricReader = new PrometheusExporter({
        endpoint: this.options.promEndpoint,
        port: this.options.promPort,
      });

      config.metricReader = metricReader;
    }

    // Add tracing if enabled
    if (this.options.enableTracing) {
      const traceExporter = new OTLPTraceExporter();
      const spanProcessor = new BatchSpanProcessor(traceExporter);

      config.spanProcessors = [spanProcessor];
    }

    return new NodeSDK(config);
  }

  /**
   * Start the tracing SDK
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      this.logger?.warn('TracingSDK is already started');

      return;
    }

    try {
      this.sdk.start();
      this.isStarted = true;
      this.logger?.log(`Tracing SDK started successfully for service: ${this.options.serviceName}`);
    } catch (error) {
      this.logger?.error('Failed to start TracingSDK:', error);
      throw error;
    }
  }

  /**
   * Shutdown the tracing SDK gracefully
   */
  async shutdown(): Promise<void> {
    if (!this.isStarted) {
      this.logger?.warn('TracingSDK is not started');

      return;
    }

    try {
      await this.sdk.shutdown();
      this.isStarted = false;
      this.logger?.log('TracingSDK shut down successfully');
    } catch (error) {
      this.logger?.error('Failed to shutdown TracingSDK', error);
    }
  }

  /**
   * Setup graceful shutdown
   * @param server - The http server instance to close
   * @param signals - The signals to listen for
   */
  setupGracefulShutdown(server: Server, signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT']): void {
    shutdownTracing(server, this.sdk, signals, this.logger);
  }

  /**
   * Check if the SDK is currently running
   * @returns true if the SDK is running, false otherwise
   */
  isRunning(): boolean {
    return this.isStarted;
  }

  /**
   * Get the underlying NodeSDK instance
   * @returns The NodeSDK instance
   */
  getSDK(): NodeSDK {
    return this.sdk;
  }

  /**
   * Get current configuration
   * @returns The current configuration
   */
  getConfig(): Required<TracingSDKOptions> {
    return { ...this.options };
  }
}

/**
 * Shutdown the OpenTelemetry SDK
 * @param server - The http server instance to close
 * @param sdk - The OpenTelemetry SDK instance
 * @param logger - The logger
 */
export async function shutdownSDK(server: Server, sdk: NodeSDK, logger?: Logger): Promise<void> {
  logger?.log('Closing http server...');
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        logger?.error('Error closing server', err);

        return reject(err);
      }

      logger?.log('Http server closed.');
      resolve();
    });
  });

  try {
    await sdk.shutdown();
    logger?.log('OpenTelemetry SDK shut down successfully.');
  } catch (err) {
    logger?.error('Error shutting down SDK', err);
  }
}

/**
 * Register signal handlers for graceful shutdown
 * @param server - The http server instance to close
 * @param sdk - The OpenTelemetry SDK instance
 * @param signals - The signals to listen for
 * @param logger - The logger
 */
export function shutdownTracing(
  server: Server,
  sdk: NodeSDK,
  signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'],
  logger?: Logger,
): void {
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger?.log(`Received ${signal}, shutting down...`);
      await shutdownSDK(server, sdk, logger);
    });
  });
}
