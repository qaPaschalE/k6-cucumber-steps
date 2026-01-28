"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("should");
const styleText_1 = require("./styleText");
const theme_1 = require("./theme");
describe('Theme', () => {
    let styleThemeItem;
    beforeEach(() => {
        const styles = {
            [theme_1.ThemeItem.DataTable]: ['bgRed'],
            [theme_1.ThemeItem.DataTableBorder]: ['red'],
            [theme_1.ThemeItem.DataTableContent]: ['blue'],
            [theme_1.ThemeItem.DocStringContent]: ['green'],
            [theme_1.ThemeItem.DocStringDelimiter]: ['red'],
            [theme_1.ThemeItem.FeatureDescription]: ['white'],
            [theme_1.ThemeItem.FeatureKeyword]: ['red'],
            [theme_1.ThemeItem.FeatureName]: ['yellow'],
            [theme_1.ThemeItem.Location]: ['bgWhite', 'black'],
            [theme_1.ThemeItem.RuleKeyword]: ['green'],
            [theme_1.ThemeItem.RuleName]: ['bgRed'],
            [theme_1.ThemeItem.ScenarioKeyword]: ['blue'],
            [theme_1.ThemeItem.ScenarioName]: ['blue', 'underline'],
            [theme_1.ThemeItem.StepKeyword]: ['magenta'],
            [theme_1.ThemeItem.StepMessage]: ['bgCyan'],
            [theme_1.ThemeItem.StepStatus]: ['bgRed'],
            [theme_1.ThemeItem.StepText]: ['bgYellow'],
            [theme_1.ThemeItem.Tag]: ['bgRed'],
        };
        styleThemeItem = theme_1.makeTheme(styles).indentStyleText;
    });
    it('applies styles to Feature keywords', () => {
        styleThemeItem(0, theme_1.ThemeItem.FeatureKeyword, 'Fonctionnalité:').should.containEql(styleText_1.styleText('Fonctionnalité:', 'red'));
    });
    it('applies styles to Feature names', () => {
        styleThemeItem(0, theme_1.ThemeItem.FeatureName, 'my feature').should.containEql(styleText_1.styleText('my feature', 'yellow'));
    });
    it('applies styles to feature descriptions', () => {
        styleThemeItem(2, theme_1.ThemeItem.FeatureDescription, 'This is some\ndescription...').should.containEql(`  ${styleText_1.styleText('This is some', 'white')}\n` +
            `  ${styleText_1.styleText('description...', 'white')}`);
    });
    it('applies styles to locations', () => {
        styleThemeItem(0, theme_1.ThemeItem.Location, '# path/to/file.feature:12').should.containEql(styleText_1.styleText('# path/to/file.feature:12', 'bgWhite', 'black'));
    });
    it('applies styles to Rule keywords', () => {
        styleThemeItem(0, theme_1.ThemeItem.RuleKeyword, 'Règle:').should.containEql(styleText_1.styleText('Règle:', 'green'));
    });
    it('applies styles to Rule names', () => {
        styleThemeItem(0, theme_1.ThemeItem.RuleName, 'my rules').should.containEql(styleText_1.styleText('my rules', 'bgRed'));
    });
    it('applies styles to Scenario keywords', () => {
        styleThemeItem(0, theme_1.ThemeItem.ScenarioKeyword, 'Scénario:').should.containEql(styleText_1.styleText('Scénario:', 'blue'));
    });
    it('applies styles to Scenario names', () => {
        styleThemeItem(0, theme_1.ThemeItem.ScenarioName, 'my scenario').should.containEql(styleText_1.styleText('my scenario', 'blue', 'underline'));
    });
    it('applies styles to Step keywords', () => {
        styleThemeItem(0, theme_1.ThemeItem.StepKeyword, 'Etant donné').should.containEql(styleText_1.styleText('Etant donné', 'magenta'));
    });
    it('applies styles to Step text', () => {
        styleThemeItem(0, theme_1.ThemeItem.StepText, 'some cucumbers').should.containEql(styleText_1.styleText('some cucumbers', 'bgYellow'));
    });
    it('applies styles to Step statuses', () => {
        styleThemeItem(0, theme_1.ThemeItem.StepStatus, '? undefined step').should.containEql(styleText_1.styleText('? undefined step', 'bgRed'));
    });
    it('applies styles to Step messages', () => {
        styleThemeItem(0, theme_1.ThemeItem.StepMessage, 'step message').should.containEql(styleText_1.styleText('step message', 'bgCyan'));
    });
    it('applies styles to DocString content', () => {
        styleThemeItem(0, theme_1.ThemeItem.DocStringContent, 'this is some docstring').should.containEql(styleText_1.styleText('this is some docstring', 'green'));
    });
    it('applies styles to DocString delimiters', () => {
        styleThemeItem(0, theme_1.ThemeItem.DocStringDelimiter, '"""').should.containEql(styleText_1.styleText('"""', 'red'));
    });
    it('applies styles to DataTable', () => {
        styleThemeItem(0, theme_1.ThemeItem.DataTable, '| foo | bar |\n| baz | oof |').should.containEql(`${styleText_1.styleText('| foo | bar |', 'bgRed')}\n${styleText_1.styleText('| baz | oof |', 'bgRed')}`);
    });
    it('applies styles to DataTable borders', () => {
        styleThemeItem(0, theme_1.ThemeItem.DataTableBorder, '|').should.containEql(styleText_1.styleText('|', 'red'));
    });
    it('applies styles to DataTable content', () => {
        styleThemeItem(0, theme_1.ThemeItem.DataTableContent, 'foo').should.containEql(styleText_1.styleText('foo', 'blue'));
    });
    it('applies styles to feature tags', () => {
        styleThemeItem(0, theme_1.ThemeItem.Tag, '@someTag').should.containEql(styleText_1.styleText('@someTag', 'bgRed'));
    });
    it('concatenates multiple strings', () => {
        styleThemeItem(0, theme_1.ThemeItem.StepKeyword, 'Etant', ' donné', ' que').should.containEql(styleText_1.styleText('Etant donné que', 'magenta'));
    });
    it('fails when applying styles to unknown theme items', () => {
        ;
        (() => styleThemeItem(0, 
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        'unknown theme item', 'text')).should.throw();
    });
    it('fails when making a theme with unknown theme items', () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ;
        (() => theme_1.makeTheme({ 'random item': ['red'] })).should.throwError('Unknown theme item "random item"');
    });
    it('defaults to unstyled items', () => {
        styleThemeItem = theme_1.makeTheme({}).indentStyleText;
        styleThemeItem(0, theme_1.ThemeItem.FeatureKeyword, 'Feature').should.eql('Feature');
        styleThemeItem(0, theme_1.ThemeItem.RuleKeyword, 'Rule').should.eql('Rule');
        styleThemeItem(0, theme_1.ThemeItem.ScenarioKeyword, 'Scenario').should.eql('Scenario');
        styleThemeItem(0, theme_1.ThemeItem.StepKeyword, 'Given').should.eql('Given');
    });
    it('allows some defined and some missing styles', () => {
        styleThemeItem = theme_1.makeTheme({
            [theme_1.ThemeItem.FeatureKeyword]: ['red'],
        }).indentStyleText;
        styleThemeItem(0, theme_1.ThemeItem.FeatureKeyword, 'Feature').should.containEql(styleText_1.styleText('Feature', 'red'));
        styleThemeItem(0, theme_1.ThemeItem.RuleKeyword, 'Rule').should.eql('Rule');
        styleThemeItem(0, theme_1.ThemeItem.ScenarioKeyword, 'Scenario').should.eql('Scenario');
        styleThemeItem(0, theme_1.ThemeItem.StepKeyword, 'Given').should.eql('Given');
    });
});
//# sourceMappingURL=theme.spec.js.map