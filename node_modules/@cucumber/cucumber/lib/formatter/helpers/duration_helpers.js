"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.durationToNanoseconds = durationToNanoseconds;
const NANOS_IN_SECOND = 1_000_000_000;
function durationToNanoseconds(duration) {
    return Math.floor(duration.seconds * NANOS_IN_SECOND + duration.nanos);
}
//# sourceMappingURL=duration_helpers.js.map