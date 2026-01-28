"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doesHaveValue = doesHaveValue;
exports.doesNotHaveValue = doesNotHaveValue;
exports.valueOrDefault = valueOrDefault;
function doesHaveValue(value) {
    return !doesNotHaveValue(value);
}
function doesNotHaveValue(value) {
    return value === null || value === undefined;
}
function valueOrDefault(value, defaultValue) {
    if (doesHaveValue(value)) {
        return value;
    }
    return defaultValue;
}
//# sourceMappingURL=value_checker.js.map