import { SummaryFormatter, IFormatterOptions } from '@cucumber/cucumber';
import { ThemeStyles } from './theme';
export declare const DEFAULT_THEME: ThemeStyles;
export default class PrettyFormatter extends SummaryFormatter {
    private uri?;
    private lastRuleId?;
    private indentOffset;
    private logItem;
    private styleItem;
    private tableLayout;
    constructor(options: IFormatterOptions);
    private parseEnvelope;
    private onTestCaseStarted;
    private onTestStepStarted;
    private onTestStepFinished;
    private onTestCaseFinished;
    private renderTags;
    private renderFeatureHead;
    private renderRule;
    private renderScenarioHead;
    private renderLocation;
    private newline;
}
//# sourceMappingURL=index.d.ts.map