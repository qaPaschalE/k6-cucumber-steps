"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
class PluginManager {
    environment;
    handlers = {
        message: [],
        'paths:resolve': [],
    };
    transformers = {
        'pickles:filter': [],
        'pickles:order': [],
    };
    cleanupFns = [];
    constructor(environment) {
        this.environment = environment;
    }
    async registerHandler(event, handler, specifier) {
        if (!this.handlers[event]) {
            throw new Error(`Cannot register handler for unknown event "${event}"`);
        }
        this.handlers[event].push({
            handler,
            specifier,
        });
    }
    async registerTransformer(event, transformer, specifier) {
        if (!this.transformers[event]) {
            throw new Error(`Cannot register transformer for unknown event "${event}"`);
        }
        this.transformers[event].push({
            transformer,
            specifier,
        });
    }
    async initFormatter(plugin, options, stream, write, directory, specifier) {
        const cleanupFn = await plugin.formatter({
            on: (key, handler) => this.registerHandler(key, handler, specifier),
            options: plugin.optionsKey
                ? (options[plugin.optionsKey] ?? {})
                : options,
            logger: this.environment.logger,
            stream,
            write,
            directory,
        });
        if (typeof cleanupFn === 'function') {
            this.cleanupFns.push({
                cleanupFn: cleanupFn,
                specifier,
            });
        }
    }
    async initCoordinator(operation, plugin, options, specifier) {
        const context = {
            operation,
            on: (event, handler) => this.registerHandler(event, handler, specifier),
            transform: (event, transformer) => this.registerTransformer(event, transformer, specifier),
            options: 'optionsKey' in plugin && plugin.optionsKey
                ? (options[plugin.optionsKey] ?? {})
                : options,
            logger: this.environment.logger,
            environment: {
                cwd: this.environment.cwd,
                stderr: this.environment.stderr,
                env: { ...this.environment.env },
            },
        };
        const cleanupFn = await wrapErrorAsync(async () => await plugin.coordinator(context), specifier, `Plugin "${specifier}" errored when trying to init`);
        if (typeof cleanupFn === 'function') {
            this.cleanupFns.push({
                cleanupFn: cleanupFn,
                specifier,
            });
        }
    }
    emit(event, value) {
        this.handlers[event].forEach(({ handler, specifier }) => {
            wrapError(() => handler(value), specifier, `Plugin "${specifier}" errored when trying to handle a "${event}" event`);
        });
    }
    async transform(event, value) {
        let transformed = value;
        for (const { transformer, specifier } of this.transformers[event]) {
            const returned = await wrapErrorAsync(async () => await transformer(transformed), specifier, `Plugin "${specifier}" errored when trying to do a "${event}" transform`);
            if (typeof returned !== 'undefined') {
                transformed = returned;
            }
        }
        return transformed;
    }
    async cleanup() {
        for (const { cleanupFn, specifier } of this.cleanupFns) {
            await wrapErrorAsync(async () => await cleanupFn(), specifier, `Plugin "${specifier}" errored when trying to cleanup`);
        }
    }
}
exports.PluginManager = PluginManager;
function wrapError(fn, specifier, message) {
    try {
        return fn();
    }
    catch (error) {
        if (specifier) {
            throw new Error(message, { cause: error });
        }
        throw error;
    }
}
async function wrapErrorAsync(fn, specifier, message) {
    try {
        return await fn();
    }
    catch (error) {
        if (specifier) {
            throw new Error(message, { cause: error });
        }
        throw error;
    }
}
//# sourceMappingURL=plugin_manager.js.map