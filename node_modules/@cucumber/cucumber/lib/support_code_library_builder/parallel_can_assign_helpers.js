"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atMostOnePicklePerTag = atMostOnePicklePerTag;
function hasTag(pickle, tagName) {
    return pickle.tags.some((t) => t.name == tagName);
}
function atMostOnePicklePerTag(tagNames) {
    return (inQuestion, inProgress) => {
        return tagNames.every((tagName) => {
            return (!hasTag(inQuestion, tagName) ||
                inProgress.every((p) => !hasTag(p, tagName)));
        });
    };
}
//# sourceMappingURL=parallel_can_assign_helpers.js.map