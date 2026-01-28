"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScenarioDescription = getScenarioDescription;
exports.getStepKeyword = getStepKeyword;
exports.getPickleStepMap = getPickleStepMap;
exports.getPickleLocation = getPickleLocation;
const gherkin_document_parser_1 = require("./gherkin_document_parser");
function getScenarioDescription({ pickle, gherkinScenarioMap, }) {
    return pickle.astNodeIds
        .map((id) => gherkinScenarioMap[id])
        .filter((x) => x != null)[0].description;
}
function getStepKeyword({ pickleStep, gherkinStepMap, }) {
    return pickleStep.astNodeIds
        .map((id) => gherkinStepMap[id])
        .filter((x) => x != null)[0].keyword;
}
function getPickleStepMap(pickle) {
    const result = {};
    pickle.steps.forEach((pickleStep) => (result[pickleStep.id] = pickleStep));
    return result;
}
function getPickleLocation({ gherkinDocument, pickle, }) {
    const gherkinScenarioLocationMap = (0, gherkin_document_parser_1.getGherkinScenarioLocationMap)(gherkinDocument);
    return gherkinScenarioLocationMap[pickle.astNodeIds[pickle.astNodeIds.length - 1]];
}
//# sourceMappingURL=pickle_parser.js.map