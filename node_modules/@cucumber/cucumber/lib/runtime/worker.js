"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const messages_1 = require("@cucumber/messages");
const user_code_runner_1 = __importDefault(require("../user_code_runner"));
const value_checker_1 = require("../value_checker");
const helpers_1 = require("../formatter/helpers");
const helpers_2 = require("./helpers");
const test_case_runner_1 = __importDefault(require("./test_case_runner"));
const scope_1 = require("./scope");
const format_error_1 = require("./format_error");
const stopwatch_1 = require("./stopwatch");
class Worker {
    testRunStartedId;
    workerId;
    eventBroadcaster;
    newId;
    options;
    supportCodeLibrary;
    snippetBuilder;
    constructor(testRunStartedId, workerId, eventBroadcaster, newId, options, supportCodeLibrary, snippetBuilder) {
        this.testRunStartedId = testRunStartedId;
        this.workerId = workerId;
        this.eventBroadcaster = eventBroadcaster;
        this.newId = newId;
        this.options = options;
        this.supportCodeLibrary = supportCodeLibrary;
        this.snippetBuilder = snippetBuilder;
    }
    async runTestRunHook(hookDefinition) {
        const testRunHookStartedId = this.newId();
        this.eventBroadcaster.emit('envelope', {
            testRunHookStarted: {
                testRunStartedId: this.testRunStartedId,
                workerId: this.workerId,
                id: testRunHookStartedId,
                hookId: hookDefinition.id,
                timestamp: (0, stopwatch_1.timestamp)(),
            },
        });
        let result;
        let error;
        if (this.options.dryRun) {
            result = {
                duration: {
                    seconds: 0,
                    nanos: 0,
                },
                status: messages_1.TestStepResultStatus.SKIPPED,
            };
        }
        else {
            const stopwatch = (0, stopwatch_1.create)().start();
            const context = { parameters: this.options.worldParameters };
            const { error: rawError } = await (0, scope_1.runInTestRunScope)({ context }, () => user_code_runner_1.default.run({
                argsArray: [],
                fn: hookDefinition.code,
                thisArg: context,
                timeoutInMilliseconds: (0, value_checker_1.valueOrDefault)(hookDefinition.options.timeout, this.supportCodeLibrary.defaultTimeout),
            }));
            const duration = stopwatch.stop().duration();
            if ((0, value_checker_1.doesHaveValue)(rawError)) {
                result = {
                    duration,
                    status: messages_1.TestStepResultStatus.FAILED,
                    ...(0, format_error_1.formatError)(rawError, this.options.filterStacktraces),
                };
                error = this.wrapTestRunHookError('a BeforeAll', (0, helpers_1.formatLocation)(hookDefinition), rawError);
            }
            else {
                result = {
                    duration,
                    status: messages_1.TestStepResultStatus.PASSED,
                };
            }
        }
        this.eventBroadcaster.emit('envelope', {
            testRunHookFinished: {
                testRunHookStartedId,
                result,
                timestamp: (0, stopwatch_1.timestamp)(),
            },
        });
        return {
            result,
            error,
        };
    }
    wrapTestRunHookError(name, location, error) {
        if (!(0, value_checker_1.doesHaveValue)(error)) {
            return undefined;
        }
        let message = `${name} hook errored`;
        if (this.workerId) {
            message += ` on worker ${this.workerId}`;
        }
        message += `, process exiting: ${location}`;
        return new Error(message, { cause: error });
    }
    async runBeforeAllHooks() {
        const results = [];
        for (const hookDefinition of this.supportCodeLibrary
            .beforeTestRunHookDefinitions) {
            const result = await this.runTestRunHook(hookDefinition);
            results.push(result);
            if ((0, value_checker_1.doesHaveValue)(result.error)) {
                throw result.error;
            }
        }
        return results;
    }
    async runTestCase({ gherkinDocument, pickle, testCase }, failing) {
        const testCaseRunner = new test_case_runner_1.default({
            workerId: this.workerId,
            eventBroadcaster: this.eventBroadcaster,
            newId: this.newId,
            gherkinDocument,
            pickle,
            testCase,
            retries: (0, helpers_2.retriesForPickle)(pickle, this.options),
            skip: this.options.dryRun || (this.options.failFast && failing),
            filterStackTraces: this.options.filterStacktraces,
            supportCodeLibrary: this.supportCodeLibrary,
            worldParameters: this.options.worldParameters,
            snippetBuilder: this.snippetBuilder,
        });
        const status = await testCaseRunner.run();
        return !(0, helpers_2.shouldCauseFailure)(status, this.options);
    }
    async runAfterAllHooks() {
        const results = [];
        const reversed = [
            ...this.supportCodeLibrary.afterTestRunHookDefinitions,
        ].reverse();
        for (const hookDefinition of reversed) {
            const result = await this.runTestRunHook(hookDefinition);
            results.push(result);
            if ((0, value_checker_1.doesHaveValue)(result.error)) {
                throw result.error;
            }
        }
        return results;
    }
}
exports.Worker = Worker;
//# sourceMappingURL=worker.js.map