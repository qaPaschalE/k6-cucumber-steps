import { Scenario, ScenarioMetadata, ProjectConfig } from "../types";
export declare class K6ScriptGenerator {
    generateK6File(scenarios: Scenario[], metadata: ScenarioMetadata[], config: ProjectConfig): string;
    private generateImports;
    private generateOptions;
    private isValidK6Metric;
    private normalizeStepText;
    private extractArguments;
    private generateTestFunction;
}
//# sourceMappingURL=k6-script.generator.d.ts.map