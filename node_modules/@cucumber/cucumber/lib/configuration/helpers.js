"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTruthyString = isTruthyString;
function isTruthyString(s) {
    if (s === undefined) {
        return false;
    }
    return s.match(/^(false|no|0)$/i) === null;
}
//# sourceMappingURL=helpers.js.map