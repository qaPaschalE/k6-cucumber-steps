export declare class K6Runner {
    runFromFeatures(featuresPath: string, outputScriptPath?: string, options?: {
        tags?: string;
        group?: string;
        language?: "js" | "ts";
        additionalK6Options?: string[];
    }): Promise<void>;
    runK6Test(scriptPath: string, additionalOptions?: string[]): Promise<void>;
    runGeneratedScript(scriptPath: string, options?: string[]): Promise<void>;
    private filterFeaturesByTags;
    private filterFeaturesByGroup;
    runWithFilters(featuresPath: string, filters: {
        tags?: string;
        group?: string;
        vus?: number;
        duration?: string;
    }): Promise<void>;
}
//# sourceMappingURL=k6.runner.d.ts.map