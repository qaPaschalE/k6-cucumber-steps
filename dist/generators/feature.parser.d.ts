import { FeatureFile, Scenario, ScenarioMetadata } from "../types";
export declare class FeatureParser {
    loadAndParseFeatures(featuresPath: string): Promise<FeatureFile[]>;
    private parseFeature;
    /**
     * Helper to map Gherkin AST steps to our internal Scenario Step format,
     * specifically handling DataTables and DocStrings.
     */
    private mapGherkinStepToInternalStep;
    loadScenarioMetadata(scenarios: Scenario[]): ScenarioMetadata[];
}
//# sourceMappingURL=feature.parser.d.ts.map