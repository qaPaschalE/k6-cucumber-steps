"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeTheme = exports.ThemeItem = void 0;
const indentStyleText_1 = require("./indentStyleText");
var ThemeItem;
(function (ThemeItem) {
    ThemeItem["DataTable"] = "datatable";
    ThemeItem["DataTableBorder"] = "datatable border";
    ThemeItem["DataTableContent"] = "datatable content";
    ThemeItem["DocStringContent"] = "docstring content";
    ThemeItem["DocStringDelimiter"] = "docstring delimiter";
    ThemeItem["FeatureDescription"] = "feature description";
    ThemeItem["FeatureKeyword"] = "feature keyword";
    ThemeItem["FeatureName"] = "feature name";
    ThemeItem["Location"] = "location";
    ThemeItem["RuleKeyword"] = "rule keyword";
    ThemeItem["RuleName"] = "rule name";
    ThemeItem["ScenarioKeyword"] = "scenario keyword";
    ThemeItem["ScenarioName"] = "scenario name";
    ThemeItem["StepKeyword"] = "step keyword";
    ThemeItem["StepMessage"] = "step message";
    ThemeItem["StepStatus"] = "step status";
    ThemeItem["StepText"] = "step text";
    ThemeItem["Tag"] = "tag";
})(ThemeItem = exports.ThemeItem || (exports.ThemeItem = {}));
const unstyledTheme = {
    [ThemeItem.DataTable]: [],
    [ThemeItem.DataTableBorder]: [],
    [ThemeItem.DataTableContent]: [],
    [ThemeItem.DocStringContent]: [],
    [ThemeItem.DocStringDelimiter]: [],
    [ThemeItem.FeatureDescription]: [],
    [ThemeItem.FeatureKeyword]: [],
    [ThemeItem.FeatureName]: [],
    [ThemeItem.Location]: [],
    [ThemeItem.RuleKeyword]: [],
    [ThemeItem.RuleName]: [],
    [ThemeItem.ScenarioKeyword]: [],
    [ThemeItem.ScenarioName]: [],
    [ThemeItem.StepKeyword]: [],
    [ThemeItem.StepMessage]: [],
    [ThemeItem.StepStatus]: [],
    [ThemeItem.StepText]: [],
    [ThemeItem.Tag]: [],
};
const makeTheme = (styles) => {
    const validateItemExists = (item) => {
        if (!Object.values(ThemeItem).includes(item))
            throw new Error(`Unknown theme item "${item}"`);
    };
    Object.keys(styles).forEach(validateItemExists);
    return {
        indentStyleText: (indent, item, ...text) => {
            validateItemExists(item);
            return indentStyleText_1.indentStyleText(indent, text.join(''), { ...unstyledTheme, ...styles }[item]);
        },
    };
};
exports.makeTheme = makeTheme;
//# sourceMappingURL=theme.js.map