"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSuggestion = makeSuggestion;
const messages_1 = require("@cucumber/messages");
const helpers_1 = require("../formatter/helpers");
function mapPickleStepTypeToKeywordType(type) {
    switch (type) {
        case messages_1.PickleStepType.CONTEXT:
            return helpers_1.KeywordType.Precondition;
        case messages_1.PickleStepType.ACTION:
            return helpers_1.KeywordType.Event;
        case messages_1.PickleStepType.OUTCOME:
            return helpers_1.KeywordType.Outcome;
        default:
            return helpers_1.KeywordType.Precondition;
    }
}
function makeSuggestion({ newId, snippetBuilder, pickleStep, }) {
    const keywordType = mapPickleStepTypeToKeywordType(pickleStep.type);
    const codes = snippetBuilder.buildMultiple({ keywordType, pickleStep });
    const snippets = codes.map((code) => ({
        code,
        language: 'javascript',
    }));
    return {
        id: newId(),
        pickleStepId: pickleStep.id,
        snippets,
    };
}
//# sourceMappingURL=make_suggestion.js.map