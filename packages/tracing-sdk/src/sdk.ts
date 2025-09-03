

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
} = process.env

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
      this.logger?.log(`TracingSDK started successfully for service: ${this.options.serviceName}`);
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
      this.logger?.error(error);
      this.logger?.error(`Failed to shutdown TracingSDK ${error}`);
    }
  }


  /**
   * Setup graceful shutdown
   */
  async setupGracefulShutdown(server: Server, signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT']): Promise<void> {
    await shutdownTracing(server, this.sdk, signals, this.logger);
  }

  /**
   * Check if the SDK is currently running
   */
  isRunning(): boolean {
    return this.isStarted;
  }

  /**
   * Get the underlying NodeSDK instance
   */
  getSDK(): NodeSDK {
    return this.sdk;
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<TracingSDKOptions> {
    return { ...this.options };
  }
}

/**
 * Shutdown the OpenTelemetry SDK
 */
export async function shutdownSDK(server: Server, sdk: NodeSDK, logger?: Logger) {
  server.close(async () => {
    await sdk
      .shutdown()
      .then(() => logger?.log('OpenTelemetry SDK shut down successfully.'))
      .catch((err: unknown) => logger?.error(err));
  })
}


export async function shutdownTracing(server: Server, sdk: NodeSDK, signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'], logger?: Logger) {
  signals.forEach((signal) => {
    process.on(signal, async () => {
      await shutdownSDK(server, sdk, logger);
    });
  });
}
