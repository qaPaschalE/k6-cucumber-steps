import { DataTable, DocString } from "@cucumber/messages";
export interface FeatureFile {
    path: string;
    content: string;
    scenarios: Scenario[];
}
export interface Scenario {
    name: string;
    steps: Step[];
    tags: string[];
    description?: string;
}
export interface Step {
    keyword: string;
    text: string;
    argument?: DataTable | DocString;
}
export interface ScenarioMetadata {
    scenarioName: string;
    vus?: number;
    duration?: string;
    thresholds?: Record<string, any>;
    tags: string[];
    group?: string;
    stages?: string;
}
export interface ProjectConfig {
    language: "js" | "ts";
    featuresDir: string;
    outputDir: string;
    includeHtmlReporter: boolean;
    author: string;
    version: string;
}
//# sourceMappingURL=index.d.ts.map