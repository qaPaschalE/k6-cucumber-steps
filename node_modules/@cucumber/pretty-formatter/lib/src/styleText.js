"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styleText = void 0;
const ansi_styles_1 = require("ansi-styles");
const styleDefs = {
    ...ansi_styles_1.bgColor,
    ...ansi_styles_1.color,
    ...ansi_styles_1.modifier,
};
const styleText = (text, ...styles) => {
    validateStyles(styles);
    return applyStyles(...styles)(text);
};
exports.styleText = styleText;
const validateStyles = (styles) => {
    styles.forEach((style) => {
        if (!(style in styleDefs))
            throw new Error(`Unknown style "${style}"`);
    });
};
const applyStyles = (...styles) => styles.reduce((fn, style) => (text) => fn(`${styleDefs[style].open}${text}${styleDefs[style].close}`), (text) => text);
//# sourceMappingURL=styleText.js.map