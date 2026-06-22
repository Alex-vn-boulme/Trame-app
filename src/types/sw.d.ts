/**
 * Ambient declaration so `src/app/sw.ts` typechecks under the same tsconfig
 * as the rest of the app. The actual runtime is a ServiceWorker, but tsc
 * treats sw.ts as a regular module without this hint.
 */
declare const self: ServiceWorkerGlobalScope;
