"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildParameterType = buildParameterType;
const cucumber_expressions_1 = require("@cucumber/cucumber-expressions");
function buildParameterType({ name, regexp, transformer, useForSnippets, preferForRegexpMatch, }) {
    if (typeof useForSnippets !== 'boolean')
        useForSnippets = true;
    if (typeof preferForRegexpMatch !== 'boolean')
        preferForRegexpMatch = false;
    return new cucumber_expressions_1.ParameterType(name, regexp, null, transformer, useForSnippets, preferForRegexpMatch);
}
//# sourceMappingURL=build_parameter_type.js.map