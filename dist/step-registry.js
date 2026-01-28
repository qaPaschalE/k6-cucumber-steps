"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stepRegistry = void 0;
exports.Given = Given;
exports.When = When;
exports.Then = Then;
exports.And = And;
exports.But = But;
// src/step-registry.ts (create this file)
// Internal registry to store step definitions
const stepRegistry = {
    givenSteps: new Map(),
    whenSteps: new Map(),
    thenSteps: new Map(),
    andSteps: new Map(),
    butSteps: new Map(),
};
exports.stepRegistry = stepRegistry;
function Given(pattern, fn) {
    stepRegistry.givenSteps.set(pattern, fn);
}
function When(pattern, fn) {
    stepRegistry.whenSteps.set(pattern, fn);
}
function Then(pattern, fn) {
    stepRegistry.thenSteps.set(pattern, fn);
}
function And(pattern, fn) {
    // And is typically treated as When in Cucumber
    stepRegistry.whenSteps.set(pattern, fn);
}
function But(pattern, fn) {
    // But is typically treated as When in Cucumber
    stepRegistry.whenSteps.set(pattern, fn);
}
//# sourceMappingURL=step-registry.js.map