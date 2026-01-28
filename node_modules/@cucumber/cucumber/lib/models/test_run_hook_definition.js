"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const definition_1 = __importDefault(require("./definition"));
class TestRunHookDefinition extends definition_1.default {
    name;
    constructor(data) {
        super(data);
        this.name = data.options.name;
    }
}
exports.default = TestRunHookDefinition;
//# sourceMappingURL=test_run_hook_definition.js.map