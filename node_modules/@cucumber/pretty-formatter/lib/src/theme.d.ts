import { TextStyle } from './styleText';
export declare enum ThemeItem {
    DataTable = "datatable",
    DataTableBorder = "datatable border",
    DataTableContent = "datatable content",
    DocStringContent = "docstring content",
    DocStringDelimiter = "docstring delimiter",
    FeatureDescription = "feature description",
    FeatureKeyword = "feature keyword",
    FeatureName = "feature name",
    Location = "location",
    RuleKeyword = "rule keyword",
    RuleName = "rule name",
    ScenarioKeyword = "scenario keyword",
    ScenarioName = "scenario name",
    StepKeyword = "step keyword",
    StepMessage = "step message",
    StepStatus = "step status",
    StepText = "step text",
    Tag = "tag"
}
export declare type ThemeStyles = {
    [key in ThemeItem]: TextStyle[];
};
export declare const makeTheme: (styles: Partial<ThemeStyles>) => ThemeHelpers;
export declare type IndentStyleThemeItem = (indent: number, item: ThemeItem, ...text: string[]) => string;
export declare type ThemeHelpers = {
    indentStyleText: IndentStyleThemeItem;
};
//# sourceMappingURL=theme.d.ts.map