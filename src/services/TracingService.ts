/*
  TracingService: тонкая обертка над OpenTelemetry Web.
  - Стартует/завершает спаны через OTel
  - Генерирует traceparent из OTel-контекста
  - Поддерживает условное включение/выключение трейсинга
*/
import { otelTracer, context, trace, provider } from './otel';
import { useTracingStore } from '../stores/tracingStore';

type HexString = string;

interface Span {
    spanId: HexString;
    name: string;
    startTime: number;
    endTime?: number;
    attributes?: Record<string, unknown>;
}

export class TracingService {
    private static instance: TracingService | null = null;
    private traceId: HexString | null = null;
    private currentSpan: Span | null = null;
    private tracestate: string | undefined;
    private rootOtelSpan: any = null;  // Храним ссылку на root OTel span
    private currentOtelSpan: any = null;  // Храним ссылку на текущий OTel span
    private ctxStack: any[] = []; // Стек контекстов для корректной вложенности

    public static getInstance(): TracingService {
        if (!this.instance) {
            this.instance = new TracingService();
        }
        return this.instance;
    }

    // 16 байт для traceId (32 hex), 8 байт для spanId (16 hex)
    private static generateId(bytes: number): HexString {
        const array = new Uint8Array(bytes);
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            crypto.getRandomValues(array);
        } else {
            for (let i = 0; i < bytes; i++) array[i] = Math.floor(Math.random() * 256);
        }
        return Array.from(array)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    }

    public startRootTrace(name: string): { traceId: HexString; spanId: HexString } {
        // Проверяем, включен ли трейсинг
        const isEnabled = useTracingStore.getState().isEnabled;
        if (!isEnabled) {
            console.log('🔍 Tracing disabled, skipping root trace');
            return { traceId: '', spanId: '' };
        }

        console.log('🔍 Starting root trace:', name);
        const span = otelTracer.startSpan(name, { kind: 1 /* CLIENT */ });
        this.rootOtelSpan = span;  // Сохраняем ссылку на root span
        const ctx = trace.setSpan(context.active(), span);
        const sc = span.spanContext();
        this.traceId = sc.traceId as HexString;
        this.currentSpan = {
            spanId: sc.spanId as HexString,
            name,
            startTime: performance.now(),
        };
        // сохраняем контекст как активный
        (this as any)._ctx = ctx;
        console.log('🔍 Root trace started:', { traceId: this.traceId, spanId: sc.spanId });
        return { traceId: this.traceId, spanId: sc.spanId as HexString };
    }

    public async endRootTrace(): Promise<void> {
        // Проверяем, включен ли трейсинг
        const isEnabled = useTracingStore.getState().isEnabled;
        if (!isEnabled) {
            console.log('🔍 Tracing disabled, skipping end root trace');
            return;
        }

        console.log('🔍 Ending root trace');
        if (!this.rootOtelSpan) {
            console.warn('🔍 No root span to end');
            return;
        }

        // Завершаем root span напрямую
        console.log('🔍 Calling rootOtelSpan.end()');
        this.rootOtelSpan.end();

        // Принудительно флашим все спаны
        console.log('🔍 Force flushing spans...');
        try {
            await provider.forceFlush();
            console.log('🔍 Flush completed');
        } catch (e) {
            console.error('🔍 Flush error:', e);
        }

        this.rootOtelSpan = null;
        this.currentOtelSpan = null;
        this.currentSpan = null;
        this.traceId = null;
        this.tracestate = undefined;
    }

    public startChildSpan(name: string, attributes?: Record<string, unknown>): { traceId: HexString; spanId: HexString; parentSpanId?: HexString } {
        // Проверяем, включен ли трейсинг
        const isEnabled = useTracingStore.getState().isEnabled;
        if (!isEnabled) {
            console.log('🔍 Tracing disabled, skipping child span');
            return { traceId: '', spanId: '', parentSpanId: undefined };
        }

        console.log('🔍 Starting child span:', name);
        const activeCtx = (this as any)._ctx || context.active();
        // Сохраняем предыдущий контекст в стек, чтобы корректно восстанавливаться при вложенных спанах
        this.ctxStack.push(activeCtx);
        const span = otelTracer.startSpan(name, { kind: 1 /* CLIENT */ }, activeCtx);
        this.currentOtelSpan = span;  // Сохраняем ссылку на child span
        const sc = span.spanContext();
        this.currentSpan = {
            spanId: sc.spanId as HexString,
            name,
            startTime: performance.now(),
            attributes,
        };
        // обновим активный контекст
        (this as any)._ctx = trace.setSpan(activeCtx, span);
        console.log('🔍 Child span started:', { traceId: sc.traceId, spanId: sc.spanId });
        return { traceId: (sc.traceId as HexString), spanId: (sc.spanId as HexString), parentSpanId: undefined };
    }

    public endSpan(): void {
        // Проверяем, включен ли трейсинг
        const isEnabled = useTracingStore.getState().isEnabled;
        if (!isEnabled) {
            console.log('🔍 Tracing disabled, skipping end span');
            return;
        }

        console.log('🔍 Ending span');
        if (!this.currentOtelSpan) {
            console.warn('🔍 No current span to end');
            return;
        }

        // Завершаем span напрямую
        console.log('🔍 Calling currentOtelSpan.end()');
        this.currentOtelSpan.end();
        this.currentOtelSpan = null;
        this.currentSpan = null;

        // Восстанавливаем контекст: сперва извлекаем из стека предыдущий
        const prevCtx = this.ctxStack.pop();
        if (prevCtx) {
            (this as any)._ctx = prevCtx;
            console.log('🔍 Context restored to previous span context');
        } else if (this.rootOtelSpan) {
            (this as any)._ctx = trace.setSpan(context.active(), this.rootOtelSpan);
            console.log('🔍 Context restored to root span');
        } else {
            (this as any)._ctx = context.active();
            console.log('🔍 Context cleared to active()');
        }
    }

    public getTraceparentFor(spanId?: HexString): string | null {
        if (!this.traceId) return null;
        // строим из текущего активного спана (или переданного spanId)
        const activeSpan = trace.getActiveSpan();
        const sc = activeSpan?.spanContext();
        const version = '00';
        const traceId = sc?.traceId || this.traceId;
        const id = spanId || sc?.spanId || this.currentSpan?.spanId || TracingService.generateId(8);
        const flags = '01'; // sampled
        if (!traceId) return null;
        return `${version}-${traceId}-${id}-${flags}`;
    }

    public getTracestate(): string | undefined {
        return this.tracestate;
    }

    public getActiveContext(): { traceId: HexString | null; spanId: HexString | null; traceparent: string | null; tracestate?: string } {
        const spanId = this.currentSpan?.spanId ?? null;
        const traceparent = this.getTraceparentFor(spanId ?? undefined);
        return {
            traceId: this.traceId,
            spanId,
            traceparent,
            tracestate: this.tracestate,
        };
    }
}

export const tracing = TracingService.getInstance();


