"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InProcessAdapter = void 0;
const worker_1 = require("../worker");
class InProcessAdapter {
    worker;
    failing = false;
    constructor(testRunStartedId, eventBroadcaster, newId, options, supportCodeLibrary, snippetBuilder) {
        this.worker = new worker_1.Worker(testRunStartedId, undefined, eventBroadcaster, newId, options, supportCodeLibrary, snippetBuilder);
    }
    async run(assembledTestCases) {
        await this.worker.runBeforeAllHooks();
        for (const item of assembledTestCases) {
            const success = await this.worker.runTestCase(item, this.failing);
            if (!success) {
                this.failing = true;
            }
        }
        await this.worker.runAfterAllHooks();
        return !this.failing;
    }
}
exports.InProcessAdapter = InProcessAdapter;
//# sourceMappingURL=adapter.js.map