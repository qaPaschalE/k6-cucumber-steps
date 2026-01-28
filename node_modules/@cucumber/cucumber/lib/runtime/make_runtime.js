"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeRuntime = makeRuntime;
const builder_1 = __importDefault(require("../formatter/builder"));
const adapter_1 = require("./parallel/adapter");
const adapter_2 = require("./serial/adapter");
const coordinator_1 = require("./coordinator");
async function makeRuntime({ environment, logger, eventBroadcaster, sourcedPickles, newId, supportCodeLibrary, options, snippetOptions, }) {
    const testRunStartedId = newId();
    const adapter = await makeAdapter(options, snippetOptions, testRunStartedId, environment, logger, eventBroadcaster, supportCodeLibrary, newId);
    return new coordinator_1.Coordinator(testRunStartedId, eventBroadcaster, newId, sourcedPickles, supportCodeLibrary, adapter);
}
async function makeAdapter(options, snippetOptions, testRunStartedId, environment, logger, eventBroadcaster, supportCodeLibrary, newId) {
    if (options.parallel > 0) {
        return new adapter_1.ChildProcessAdapter(testRunStartedId, environment, logger, eventBroadcaster, options, snippetOptions, supportCodeLibrary);
    }
    const snippetBuilder = await builder_1.default.getStepDefinitionSnippetBuilder({
        cwd: environment.cwd,
        snippetInterface: snippetOptions.snippetInterface,
        snippetSyntax: snippetOptions.snippetSyntax,
        supportCodeLibrary,
    });
    return new adapter_2.InProcessAdapter(testRunStartedId, eventBroadcaster, newId, options, supportCodeLibrary, snippetBuilder);
}
//# sourceMappingURL=make_runtime.js.map