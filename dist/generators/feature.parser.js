"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureParser = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Gherkin = __importStar(require("@cucumber/gherkin"));
const Messages = __importStar(require("@cucumber/messages"));
class FeatureParser {
    async loadAndParseFeatures(featuresPath) {
        // Resolve path relative to the Current Working Directory
        const resolvedPath = path_1.default.resolve(process.cwd(), featuresPath);
        const featureFiles = [];
        if (!fs_1.default.existsSync(resolvedPath)) {
            throw new Error(`The path "${featuresPath}" does not exist at ${resolvedPath}`);
        }
        if (fs_1.default.statSync(resolvedPath).isDirectory()) {
            const files = fs_1.default.readdirSync(resolvedPath);
            for (const file of files) {
                if (file.endsWith(".feature")) {
                    const fullPath = path_1.default.join(resolvedPath, file);
                    const content = fs_1.default.readFileSync(fullPath, "utf8");
                    featureFiles.push(this.parseFeature(content, fullPath));
                }
            }
        }
        else {
            const content = fs_1.default.readFileSync(resolvedPath, "utf8");
            featureFiles.push(this.parseFeature(content, resolvedPath));
        }
        return featureFiles;
    }
    parseFeature(content, filePath) {
        try {
            const uuidFn = Messages.IdGenerator.incrementing();
            const builder = new Gherkin.AstBuilder(uuidFn);
            const matcher = new Gherkin.GherkinClassicTokenMatcher();
            const parser = new Gherkin.Parser(builder, matcher);
            const gherkinDocument = parser.parse(content);
            if (!gherkinDocument || !gherkinDocument.feature) {
                throw new Error("No feature found in file.");
            }
            // 1. Capture Feature-level tags for inheritance
            const featureTags = (gherkinDocument.feature.tags || []).map((tag) => tag.name.replace("@", ""));
            // 2. Extract Background Steps (to be prepended to all scenarios)
            const backgroundSteps = [];
            const backgroundChild = gherkinDocument.feature.children.find((child) => child.background);
            if (backgroundChild && backgroundChild.background) {
                backgroundChild.background.steps.forEach((step) => {
                    backgroundSteps.push(this.mapGherkinStepToInternalStep(step));
                });
            }
            const scenarios = [];
            // 3. Process Children (Scenarios and Scenario Outlines)
            if (gherkinDocument.feature.children) {
                for (const child of gherkinDocument.feature.children) {
                    if (child.scenario) {
                        const scenario = child.scenario;
                        const combinedTags = [
                            ...featureTags,
                            ...(scenario.tags || []).map((tag) => tag.name.replace("@", "")),
                        ];
                        // 4. Handle Scenario Outlines (Examples)
                        if (scenario.examples && scenario.examples.length > 0) {
                            for (const exampleGroup of scenario.examples) {
                                const tableHeader = exampleGroup.tableHeader?.cells.map((c) => c.value) ||
                                    [];
                                const tableBody = exampleGroup.tableBody || [];
                                tableBody.forEach((row, rowIndex) => {
                                    const rowData = {};
                                    row.cells.forEach((cell, cellIndex) => {
                                        rowData[tableHeader[cellIndex]] = cell.value;
                                    });
                                    // Process steps: inject background + replace placeholders + map arguments
                                    const scenarioSteps = scenario.steps.map((step) => {
                                        let newText = step.text;
                                        // Replace <placeholders>
                                        Object.keys(rowData).forEach((key) => {
                                            newText = newText.replace(new RegExp(`<${key}>`, "g"), rowData[key]);
                                        });
                                        return this.mapGherkinStepToInternalStep(step, newText);
                                    });
                                    scenarios.push({
                                        name: `${scenario.name} (Row ${rowIndex + 1})`,
                                        steps: [...backgroundSteps, ...scenarioSteps],
                                        tags: combinedTags,
                                        description: scenario.description || "",
                                    });
                                });
                            }
                        }
                        else {
                            // 5. Handle Standard Scenarios
                            const scenarioSteps = scenario.steps.map((step) => this.mapGherkinStepToInternalStep(step));
                            scenarios.push({
                                name: scenario.name,
                                steps: [...backgroundSteps, ...scenarioSteps],
                                tags: combinedTags,
                                description: scenario.description || "",
                            });
                        }
                    }
                }
            }
            return { path: filePath, content, scenarios };
        }
        catch (error) {
            throw new Error(`Error parsing feature file ${filePath}: ${error.message}`);
        }
    }
    /**
     * Helper to map Gherkin AST steps to our internal Scenario Step format,
     * specifically handling DataTables and DocStrings.
     */
    mapGherkinStepToInternalStep(gherkinStep, overrideText) {
        let argument = null;
        // Handle DataTables: Convert to Array of Objects
        if (gherkinStep.dataTable) {
            const rows = gherkinStep.dataTable.rows;
            if (rows.length > 0) {
                const header = rows[0].cells.map((c) => c.value);
                argument = rows.slice(1).map((row) => {
                    const obj = {};
                    row.cells.forEach((cell, i) => {
                        obj[header[i]] = cell.value;
                    });
                    return obj;
                });
            }
        }
        // Handle DocStrings
        else if (gherkinStep.docString) {
            argument = gherkinStep.docString.content;
        }
        return {
            keyword: gherkinStep.keyword.trim(),
            text: overrideText || gherkinStep.text,
            argument: argument,
        };
    }
    loadScenarioMetadata(scenarios) {
        return scenarios.map((scenario) => {
            const metadata = {
                scenarioName: scenario.name,
                tags: scenario.tags,
            };
            for (const tag of scenario.tags) {
                if (tag.startsWith("vus:")) {
                    metadata.vus = parseInt(tag.split(":")[1]);
                }
                else if (tag.startsWith("duration:")) {
                    metadata.duration = tag.split(":")[1];
                }
                else if (tag.startsWith("stages:")) {
                    metadata.stages = tag.split(":")[1];
                }
                else if (tag.startsWith("threshold:")) {
                    const split = tag.split(":")[1].split("=");
                    if (split.length === 2) {
                        metadata.thresholds = metadata.thresholds || {};
                        metadata.thresholds[split[0]] = split[1];
                    }
                }
                else if (tag.startsWith("group:")) {
                    metadata.group = tag.split(":")[1];
                }
            }
            return metadata;
        });
    }
}
exports.FeatureParser = FeatureParser;
//# sourceMappingURL=feature.parser.js.map