"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.footer = void 0;
const utils_1 = require("../../../../utils");
function footer(context) {
    const hideGenerator = context.options.getValue("hideGenerator");
    return (utils_1.JSX.createElement("footer", null,
        context.hook("footer.begin"),
        hideGenerator || (utils_1.JSX.createElement("p", { class: "tsd-generator" },
            "Generated using ",
            utils_1.JSX.createElement("a", { href: "https://typedoc.org/", target: "_blank" }, "TypeDoc"))),
        context.hook("footer.end")));
}
exports.footer = footer;
