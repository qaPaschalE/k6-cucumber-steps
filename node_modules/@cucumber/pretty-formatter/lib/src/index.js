"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_THEME = void 0;
const cucumber_1 = require("@cucumber/cucumber");
const CliTable3 = require("cli-table3");
const figures_1 = require("figures");
const os_1 = require("os");
const ts_dedent_1 = require("ts-dedent");
const theme_1 = require("./theme");
const { formatLocation, GherkinDocumentParser, PickleParser } = cucumber_1.formatterHelpers;
const { getGherkinExampleRuleMap, getGherkinScenarioMap, getGherkinStepMap } = GherkinDocumentParser;
const { getPickleStepMap } = PickleParser;
const marks = {
    [cucumber_1.Status.AMBIGUOUS]: figures_1.cross,
    [cucumber_1.Status.FAILED]: figures_1.cross,
    [cucumber_1.Status.PASSED]: figures_1.tick,
    [cucumber_1.Status.PENDING]: '?',
    [cucumber_1.Status.SKIPPED]: '-',
    [cucumber_1.Status.UNDEFINED]: '?',
    [cucumber_1.Status.UNKNOWN]: '?',
};
const themeItemIndentations = {
    [theme_1.ThemeItem.DataTable]: 6,
    [theme_1.ThemeItem.DataTableBorder]: 0,
    [theme_1.ThemeItem.DataTableContent]: 0,
    [theme_1.ThemeItem.DocStringContent]: 6,
    [theme_1.ThemeItem.DocStringDelimiter]: 6,
    [theme_1.ThemeItem.FeatureDescription]: 2,
    [theme_1.ThemeItem.FeatureKeyword]: 0,
    [theme_1.ThemeItem.FeatureName]: 0,
    [theme_1.ThemeItem.Location]: 0,
    [theme_1.ThemeItem.RuleKeyword]: 2,
    [theme_1.ThemeItem.RuleName]: 0,
    [theme_1.ThemeItem.ScenarioKeyword]: 2,
    [theme_1.ThemeItem.ScenarioName]: 0,
    [theme_1.ThemeItem.StepKeyword]: 4,
    [theme_1.ThemeItem.StepMessage]: 6,
    [theme_1.ThemeItem.StepStatus]: 4,
    [theme_1.ThemeItem.StepText]: 0,
    [theme_1.ThemeItem.Tag]: 0,
};
exports.DEFAULT_THEME = {
    [theme_1.ThemeItem.DataTable]: [],
    [theme_1.ThemeItem.DataTableBorder]: ['gray'],
    [theme_1.ThemeItem.DataTableContent]: ['gray', 'italic'],
    [theme_1.ThemeItem.DocStringContent]: ['gray', 'italic'],
    [theme_1.ThemeItem.DocStringDelimiter]: ['gray'],
    [theme_1.ThemeItem.FeatureDescription]: ['gray'],
    [theme_1.ThemeItem.FeatureKeyword]: ['blueBright', 'bold'],
    [theme_1.ThemeItem.FeatureName]: ['blueBright', 'underline'],
    [theme_1.ThemeItem.Location]: ['dim'],
    [theme_1.ThemeItem.RuleKeyword]: ['blueBright', 'bold'],
    [theme_1.ThemeItem.RuleName]: ['blueBright', 'underline'],
    [theme_1.ThemeItem.ScenarioKeyword]: ['cyan', 'bold'],
    [theme_1.ThemeItem.ScenarioName]: ['cyan', 'underline'],
    [theme_1.ThemeItem.StepKeyword]: ['cyan'],
    [theme_1.ThemeItem.StepMessage]: [],
    [theme_1.ThemeItem.StepStatus]: [],
    [theme_1.ThemeItem.StepText]: [],
    [theme_1.ThemeItem.Tag]: ['cyan'],
};
class PrettyFormatter extends cucumber_1.SummaryFormatter {
    constructor(options) {
        super(options);
        this.indentOffset = 0;
        const theme = theme_1.makeTheme(!!options.parsedArgvOptions.colorsEnabled
            ? options.parsedArgvOptions.theme || exports.DEFAULT_THEME
            : {});
        this.styleItem = (indent, item, ...text) => {
            if (indent > 0 && this.indentOffset > 0)
                indent = indent + this.indentOffset;
            return theme.indentStyleText(indent, item, ...text);
        };
        this.logItem = (item, ...text) => this.log(this.styleItem(themeItemIndentations[item], item, ...text));
        this.parseEnvelope = this.parseEnvelope.bind(this);
        const tableFrameChar = theme.indentStyleText(0, theme_1.ThemeItem.DataTableBorder, '│');
        this.tableLayout = {
            chars: {
                left: tableFrameChar,
                middle: tableFrameChar,
                right: tableFrameChar,
                top: '',
                'top-left': '',
                'top-mid': '',
                'top-right': '',
                mid: '',
                'left-mid': '',
                'mid-mid': '',
                'right-mid': '',
                bottom: '',
                'bottom-left': '',
                'bottom-mid': '',
                'bottom-right': '',
            },
            style: {
                head: [],
                border: [],
            },
        };
        options.eventBroadcaster.on('envelope', this.parseEnvelope);
    }
    parseEnvelope(envelope) {
        if (envelope.testCaseStarted)
            this.onTestCaseStarted(envelope.testCaseStarted);
        if (envelope.testStepStarted)
            this.onTestStepStarted(envelope.testStepStarted);
        if (envelope.testStepFinished)
            this.onTestStepFinished(envelope.testStepFinished);
        if (envelope.testCaseFinished)
            this.onTestCaseFinished(envelope.testCaseFinished);
    }
    onTestCaseStarted(testCaseStarted) {
        const { gherkinDocument, pickle } = this.eventDataCollector.getTestCaseAttempt(testCaseStarted.id || '');
        const { feature } = gherkinDocument;
        if (this.uri !== gherkinDocument.uri && feature) {
            this.indentOffset = 0;
            this.uri = gherkinDocument.uri || '';
            this.lastRuleId = undefined;
            this.renderFeatureHead(feature);
        }
        const gherkinExampleRuleMap = getGherkinExampleRuleMap(gherkinDocument);
        if (!pickle.astNodeIds)
            throw new Error('Pickle AST nodes missing');
        const rule = gherkinExampleRuleMap[pickle.astNodeIds[0]];
        if (rule && rule.id !== this.lastRuleId) {
            this.indentOffset = 0;
            this.renderRule(rule);
            this.lastRuleId = rule.id;
            this.indentOffset = 2;
        }
        this.renderScenarioHead(gherkinDocument, pickle);
    }
    onTestStepStarted(testStepStarted) {
        const { gherkinDocument, pickle, testCase } = this.eventDataCollector.getTestCaseAttempt(testStepStarted.testCaseStartedId || '');
        const pickleStepMap = getPickleStepMap(pickle);
        const gherkinStepMap = getGherkinStepMap(gherkinDocument);
        const testStep = (testCase.testSteps || []).find((item) => item.id === testStepStarted.testStepId);
        if (testStep && testStep.pickleStepId) {
            const pickleStep = pickleStepMap[testStep.pickleStepId];
            const astNodeId = pickleStep.astNodeIds[0];
            const gherkinStep = gherkinStepMap[astNodeId];
            this.logItem(theme_1.ThemeItem.StepKeyword, gherkinStep.keyword);
            this.log(' ');
            this.logItem(theme_1.ThemeItem.StepText, pickleStep.text);
            this.newline();
            if (gherkinStep.docString) {
                this.logItem(theme_1.ThemeItem.DocStringDelimiter, gherkinStep.docString.delimiter);
                this.newline();
                this.logItem(theme_1.ThemeItem.DocStringContent, gherkinStep.docString.content);
                this.newline();
                this.logItem(theme_1.ThemeItem.DocStringDelimiter, gherkinStep.docString.delimiter);
                this.newline();
            }
            if (gherkinStep.dataTable) {
                const datatable = new CliTable3(this.tableLayout);
                datatable.push(...gherkinStep.dataTable.rows.map((row) => (row.cells || []).map((cell) => this.styleItem(0, theme_1.ThemeItem.DataTableContent, cell.value || ''))));
                this.logItem(theme_1.ThemeItem.DataTable, datatable.toString());
                this.newline();
            }
        }
    }
    onTestStepFinished(testStepFinished) {
        const { message, status } = testStepFinished.testStepResult || {};
        if (status && status !== cucumber_1.Status.PASSED) {
            this.logItem(theme_1.ThemeItem.StepStatus, this.colorFns.forStatus(status)(`${marks[status]} ${cucumber_1.Status[status].toLowerCase()}`));
            this.newline();
            if (message) {
                this.logItem(theme_1.ThemeItem.StepMessage, message);
                this.newline();
            }
        }
    }
    onTestCaseFinished(_testCaseFinished) {
        this.newline();
    }
    renderTags(indent, tags) {
        const tagStrings = tags.reduce((tags, tag) => (tag.name ? [...tags, tag.name] : tags), []);
        if (tagStrings.length > 0) {
            const firstTag = tagStrings.shift();
            this.log(this.styleItem(indent, theme_1.ThemeItem.Tag, firstTag));
            tagStrings.forEach((tag) => {
                this.log(' ');
                this.logItem(theme_1.ThemeItem.Tag, tag);
            });
            this.newline();
        }
    }
    renderFeatureHead(feature) {
        var _a;
        this.renderTags(0, feature.tags || []);
        this.logItem(theme_1.ThemeItem.FeatureKeyword, feature.keyword || '[feature]', ':');
        this.log(' ');
        this.logItem(theme_1.ThemeItem.FeatureName, feature.name || '');
        if (feature.location) {
            this.log(' ');
            this.renderLocation(((_a = feature.location) === null || _a === void 0 ? void 0 : _a.line) || -1);
        }
        this.newline();
        if (feature.description) {
            this.newline();
            this.logItem(theme_1.ThemeItem.FeatureDescription, ts_dedent_1.default(feature.description.trim()));
            this.newline();
        }
        this.newline();
    }
    renderRule(rule) {
        this.logItem(theme_1.ThemeItem.RuleKeyword, rule.keyword, ':');
        this.log(' ');
        this.logItem(theme_1.ThemeItem.RuleName, rule.name || '');
        this.newline();
        this.newline();
    }
    renderScenarioHead(gherkinDocument, pickle) {
        var _a;
        this.renderTags(2, pickle.tags || []);
        const gherkinScenarioMap = getGherkinScenarioMap(gherkinDocument);
        if (!pickle.astNodeIds)
            throw new Error('Pickle AST nodes missing');
        const scenario = gherkinScenarioMap[pickle.astNodeIds[0]];
        this.logItem(theme_1.ThemeItem.ScenarioKeyword, scenario.keyword || '???', ':');
        this.log(' ');
        this.logItem(theme_1.ThemeItem.ScenarioName, pickle.name || '');
        if (gherkinScenarioMap[pickle.astNodeIds[0]]) {
            this.log(' ');
            this.renderLocation(((_a = scenario.location) === null || _a === void 0 ? void 0 : _a.line) || -1);
        }
        this.newline();
    }
    renderLocation(line) {
        this.logItem(theme_1.ThemeItem.Location, '# ', formatLocation({ uri: this.uri || '', line }, process.cwd()));
    }
    newline() {
        this.log(os_1.EOL);
    }
}
exports.default = PrettyFormatter;
//# sourceMappingURL=index.js.map