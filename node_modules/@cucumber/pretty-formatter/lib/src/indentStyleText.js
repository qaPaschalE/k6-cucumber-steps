"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indentStyleText = void 0;
const styleText_1 = require("./styleText");
const indentStyleText = (indent, text, styles = []) => text.replace(/^(.+)$/gm, (subText) => subText.trim().length === 0
    ? ''
    : `${' '.repeat(indent)}${styleText_1.styleText(subText.trimRight(), ...styles)}`);
exports.indentStyleText = indentStyleText;
//# sourceMappingURL=indentStyleText.js.map