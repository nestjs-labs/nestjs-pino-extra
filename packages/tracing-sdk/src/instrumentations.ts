import type { Instrumentation } from '@opentelemetry/instrumentation';

import { getNodeAutoInstrumentations, type InstrumentationConfigMap } from '@opentelemetry/auto-instrumentations-node';

/**
 * default nestjs instrumentations
 * @returns the default nestjs instrumentations
 */
export function getNestjsConfigMap(): InstrumentationConfigMap {
	return {
		'@opentelemetry/instrumentation-express': { enabled: true, ignoreLayers: ['/health'] },
		'@opentelemetry/instrumentation-http': { enabled: true },
		'@opentelemetry/instrumentation-ioredis': { enabled: true },
		'@opentelemetry/instrumentation-nestjs-core': { enabled: true },
		'@opentelemetry/instrumentation-pg': { enabled: true },
		'@opentelemetry/instrumentation-pino': { enabled: true },
	};
}

/**
 * @param extra - extra instrumentations to add to the instrumentations
 * @param nodeAutoConfigMap - the node auto instrumentations config map
 * @returns 
 */
export function getSdkInstrumentations(extra: Instrumentation[] = [], nodeAutoConfigMap?: InstrumentationConfigMap): Instrumentation[] {
	const autoInstrumentations = nodeAutoConfigMap ? getNodeAutoInstrumentations(nodeAutoConfigMap) : [];

	return [...autoInstrumentations, ...extra];
}