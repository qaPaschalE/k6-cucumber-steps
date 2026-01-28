declare const stepRegistry: {
    givenSteps: Map<string, Function>;
    whenSteps: Map<string, Function>;
    thenSteps: Map<string, Function>;
    andSteps: Map<string, Function>;
    butSteps: Map<string, Function>;
};
export declare function Given(pattern: string, fn: Function): void;
export declare function When(pattern: string, fn: Function): void;
export declare function Then(pattern: string, fn: Function): void;
export declare function And(pattern: string, fn: Function): void;
export declare function But(pattern: string, fn: Function): void;
export { stepRegistry };
//# sourceMappingURL=step-registry.d.ts.map