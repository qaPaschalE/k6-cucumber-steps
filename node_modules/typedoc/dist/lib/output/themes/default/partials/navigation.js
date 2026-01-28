"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pageNavigation = exports.pageSidebar = exports.navigation = exports.settings = exports.sidebarLinks = exports.sidebar = void 0;
const models_1 = require("../../../../models");
const utils_1 = require("../../../../utils");
const lib_1 = require("../../lib");
function sidebar(context, props) {
    return (utils_1.JSX.createElement(utils_1.JSX.Fragment, null,
        context.sidebarLinks(),
        context.navigation(props)));
}
exports.sidebar = sidebar;
function buildFilterItem(context, name, displayName, defaultValue) {
    return (utils_1.JSX.createElement("li", { class: "tsd-filter-item" },
        utils_1.JSX.createElement("label", { class: "tsd-filter-input" },
            utils_1.JSX.createElement("input", { type: "checkbox", id: `tsd-filter-${name}`, name: name, checked: defaultValue }),
            context.icons.checkbox(),
            utils_1.JSX.createElement("span", null, displayName))));
}
function sidebarLinks(context) {
    const links = Object.entries(context.options.getValue("sidebarLinks"));
    if (!links.length)
        return null;
    return (utils_1.JSX.createElement("nav", { id: "tsd-sidebar-links", class: "tsd-navigation" }, links.map(([label, url]) => (utils_1.JSX.createElement("a", { href: url }, label)))));
}
exports.sidebarLinks = sidebarLinks;
function settings(context) {
    const defaultFilters = context.options.getValue("visibilityFilters");
    const visibilityOptions = [];
    for (const key of Object.keys(defaultFilters)) {
        if (key.startsWith("@")) {
            const filterName = key
                .substring(1)
                .replace(/([a-z])([A-Z])/g, "$1-$2")
                .toLowerCase();
            visibilityOptions.push(buildFilterItem(context, filterName, (0, lib_1.camelToTitleCase)(key.substring(1)), defaultFilters[key]));
        }
        else if ((key === "protected" && !context.options.getValue("excludeProtected")) ||
            (key === "private" && !context.options.getValue("excludePrivate")) ||
            (key === "external" && !context.options.getValue("excludeExternals")) ||
            key === "inherited") {
            visibilityOptions.push(buildFilterItem(context, key, (0, lib_1.camelToTitleCase)(key), defaultFilters[key]));
        }
    }
    // Settings panel above navigation
    return (utils_1.JSX.createElement("div", { class: "tsd-navigation settings" },
        utils_1.JSX.createElement("details", { class: "tsd-index-accordion", open: false },
            utils_1.JSX.createElement("summary", { class: "tsd-accordion-summary" },
                utils_1.JSX.createElement("h3", null,
                    context.icons.chevronDown(),
                    "Settings")),
            utils_1.JSX.createElement("div", { class: "tsd-accordion-details" },
                visibilityOptions.length && (utils_1.JSX.createElement("div", { class: "tsd-filter-visibility" },
                    utils_1.JSX.createElement("h4", { class: "uppercase" }, "Member Visibility"),
                    utils_1.JSX.createElement("form", null,
                        utils_1.JSX.createElement("ul", { id: "tsd-filter-options" }, ...visibilityOptions)))),
                utils_1.JSX.createElement("div", { class: "tsd-theme-toggle" },
                    utils_1.JSX.createElement("h4", { class: "uppercase" }, "Theme"),
                    utils_1.JSX.createElement("select", { id: "tsd-theme" },
                        utils_1.JSX.createElement("option", { value: "os" }, "OS"),
                        utils_1.JSX.createElement("option", { value: "light" }, "Light"),
                        utils_1.JSX.createElement("option", { value: "dark" }, "Dark")))))));
}
exports.settings = settings;
const navigation = function navigation(context, props) {
    return (utils_1.JSX.createElement("nav", { class: "tsd-navigation" },
        utils_1.JSX.createElement("a", { href: context.urlTo(props.project), class: (0, lib_1.classNames)({ current: props.project === props.model }) },
            context.icons[models_1.ReflectionKind.Project](),
            utils_1.JSX.createElement("span", null, (0, lib_1.getDisplayName)(props.project))),
        utils_1.JSX.createElement("ul", { class: "tsd-small-nested-navigation", id: "tsd-nav-container", "data-base": context.relativeURL("./") },
            utils_1.JSX.createElement("li", null, "Loading..."))));
};
exports.navigation = navigation;
function pageSidebar(context, props) {
    return (utils_1.JSX.createElement(utils_1.JSX.Fragment, null,
        context.settings(),
        context.pageNavigation(props)));
}
exports.pageSidebar = pageSidebar;
function pageNavigation(context, props) {
    const levels = [[]];
    function finalizeLevel(finishedHandlingHeadings) {
        const level = levels.pop();
        if (levels[levels.length - 1].length === 0 && finishedHandlingHeadings) {
            levels[levels.length - 1] = level;
            return;
        }
        const built = (utils_1.JSX.createElement("ul", null, level.map((l) => (utils_1.JSX.createElement("li", null, l)))));
        levels[levels.length - 1].push(built);
    }
    for (const heading of props.pageHeadings) {
        const inferredLevel = heading.level ? heading.level + 1 : 1;
        while (inferredLevel < levels.length) {
            finalizeLevel(false);
        }
        while (inferredLevel > levels.length) {
            // Lower level than before
            levels.push([]);
        }
        levels[levels.length - 1].push(utils_1.JSX.createElement("a", { href: heading.link, class: heading.classes },
            heading.kind && context.icons[heading.kind](),
            utils_1.JSX.createElement("span", null, (0, lib_1.wbr)(heading.text))));
    }
    while (levels.length > 1) {
        finalizeLevel(true);
    }
    if (!levels[0].length) {
        return utils_1.JSX.createElement(utils_1.JSX.Fragment, null);
    }
    levels.unshift([]);
    finalizeLevel(true);
    return (utils_1.JSX.createElement("details", { open: true, class: "tsd-index-accordion tsd-page-navigation" },
        utils_1.JSX.createElement("summary", { class: "tsd-accordion-summary" },
            utils_1.JSX.createElement("h3", null,
                context.icons.chevronDown(),
                "On This Page")),
        utils_1.JSX.createElement("div", { class: "tsd-accordion-details" }, levels[0])));
}
exports.pageNavigation = pageNavigation;
