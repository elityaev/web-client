import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor, ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { context, propagation, trace } from '@opentelemetry/api';
import { getEnv } from '../utils/env';

// Создаем resource с атрибутами сервиса
const resourceAttributes = {
    'service.name': 'web-client',
    'service.version': '1.0.0',
};

const config: any = {
    resource: {
        attributes: resourceAttributes
    }
};

const provider = new WebTracerProvider(config);

// Для dev используем OTLP через Caddy CORS proxy на порту 4319
// Для prod задай VITE_OTLP_HTTP_URL
const otlpEnabled = getEnv('VITE_OTLP_ENABLED') === 'true';
const otlpUrl = getEnv('VITE_OTLP_HTTP_URL') || 'http://localhost:4319/v1/traces';

let exporter: any;
if (otlpEnabled) {
    console.log('🔍 Using OTLP exporter:', otlpUrl);
    exporter = new OTLPTraceExporter({
        url: otlpUrl,
        headers: {
            'Content-Type': 'application/json'
        }
    });
} else {
    console.log('🔍 Using Console exporter (dev mode)');
    exporter = new ConsoleSpanExporter();
}

// Перехватываем ошибки экспортера (только для OTLP)
if (otlpEnabled) {
    const originalExport = exporter.export.bind(exporter);
    exporter.export = (spans: any, resultCallback: any) => {
        console.log('🔍 OTLP Exporter: sending', spans.length, 'spans to', otlpUrl);

        // Логируем структуру первого span'а
        if (spans.length > 0) {
            console.log('🔍 Span resource.attributes:', spans[0].resource?.attributes);
        }

        return originalExport(spans, (result: any) => {
            if (result.code !== 0) {
                console.error('🔍 OTLP Exporter error:', result);
            } else {
                console.log('🔍 OTLP Exporter success');
            }
            resultCallback(result);
        });
    };
}

// Используем SimpleSpanProcessor для немедленной отправки
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register({
    contextManager: new ZoneContextManager(),
    propagator: new W3CTraceContextPropagator(),
});

const otelTracer = trace.getTracer('web-client', '1.0.0');

// Логируем каждое создание спана
const originalStartSpan = otelTracer.startSpan.bind(otelTracer);
(otelTracer as any).startSpan = function (name: string, options?: any, ctx?: any) {
    console.log('🔍 OTel: Creating span:', name, 'options:', options, 'hasContext:', !!ctx);
    const span = originalStartSpan(name, options, ctx);
    console.log('🔍 OTel: Span created:', span.spanContext());

    // Логируем когда спан завершается
    const originalEnd = span.end.bind(span);
    span.end = function (endTime?: any) {
        console.log('🔍 OTel: Span ending:', name, span.spanContext());
        return originalEnd(endTime);
    };

    return span;
};

export { otelTracer, context, propagation, trace, provider };


