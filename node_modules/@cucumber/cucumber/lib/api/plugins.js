"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeForLoadSources = initializeForLoadSources;
exports.initializeForLoadSupport = initializeForLoadSupport;
exports.initializeForRunCucumber = initializeForRunCucumber;
const node_url_1 = require("node:url");
const node_path_1 = __importDefault(require("node:path"));
const filter_1 = __importDefault(require("../filter"));
const plugin_1 = require("../plugin");
const publish_1 = __importDefault(require("../publish"));
const sharding_1 = __importDefault(require("../sharding"));
const value_checker_1 = require("../value_checker");
async function importPlugin(specifier, cwd) {
    try {
        let normalized = specifier;
        if (specifier.startsWith('.')) {
            normalized = (0, node_url_1.pathToFileURL)(node_path_1.default.resolve(cwd, specifier));
        }
        else if (specifier.startsWith('file://')) {
            normalized = new URL(specifier);
        }
        return await import(normalized.toString());
    }
    catch (e) {
        throw new Error(`Failed to import plugin ${specifier}`, {
            cause: e,
        });
    }
}
function findPlugin(imported) {
    return findPluginRecursive(imported, 3);
}
function findPluginRecursive(thing, depth) {
    if ((0, value_checker_1.doesNotHaveValue)(thing)) {
        return null;
    }
    if (typeof thing === 'object' && thing.type === 'plugin') {
        return thing;
    }
    depth--;
    if (depth > 0) {
        return findPluginRecursive(thing.default, depth);
    }
    return null;
}
async function loadPlugin(specifier, cwd) {
    const imported = await importPlugin(specifier, cwd);
    const found = findPlugin(imported);
    if (!found) {
        throw new Error(`${specifier} does not export a plugin`);
    }
    return found;
}
async function initializeForLoadSources(coordinates, environment) {
    // eventually we'll load plugin packages here
    const pluginManager = new plugin_1.PluginManager(environment);
    await pluginManager.initCoordinator('loadSources', filter_1.default, coordinates);
    return pluginManager;
}
async function initializeForLoadSupport(environment) {
    // eventually we'll load plugin packages here
    return new plugin_1.PluginManager(environment);
}
async function initializeForRunCucumber(configuration, environment) {
    const pluginManager = new plugin_1.PluginManager(environment);
    await pluginManager.initCoordinator('runCucumber', publish_1.default, configuration.formats.publish);
    await pluginManager.initCoordinator('runCucumber', filter_1.default, configuration.sources);
    await pluginManager.initCoordinator('runCucumber', sharding_1.default, configuration.sources);
    if (configuration.plugins) {
        for (const specifier of configuration.plugins.specifiers) {
            const plugin = await loadPlugin(specifier, environment.cwd);
            await pluginManager.initCoordinator('runCucumber', plugin, configuration.plugins.options, specifier);
        }
    }
    return pluginManager;
}
//# sourceMappingURL=plugins.js.map