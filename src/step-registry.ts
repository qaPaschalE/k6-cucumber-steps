// src/step-registry.ts (create this file)
// Internal registry to store step definitions
const stepRegistry = {
  givenSteps: new Map<string, Function>(),
  whenSteps: new Map<string, Function>(),
  thenSteps: new Map<string, Function>(),
  andSteps: new Map<string, Function>(),
  butSteps: new Map<string, Function>(),
};

export function Given(pattern: string, fn: Function): void {
  stepRegistry.givenSteps.set(pattern, fn);
}

export function When(pattern: string, fn: Function): void {
  stepRegistry.whenSteps.set(pattern, fn);
}

export function Then(pattern: string, fn: Function): void {
  stepRegistry.thenSteps.set(pattern, fn);
}

export function And(pattern: string, fn: Function): void {
  // And is typically treated as When in Cucumber
  stepRegistry.whenSteps.set(pattern, fn);
}

export function But(pattern: string, fn: Function): void {
  // But is typically treated as When in Cucumber
  stepRegistry.whenSteps.set(pattern, fn);
}

export { stepRegistry };
