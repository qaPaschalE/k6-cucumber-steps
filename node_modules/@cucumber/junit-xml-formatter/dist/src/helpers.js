import { TimeConversion, } from '@cucumber/messages';
import { DateTime } from 'luxon';
export function durationToSeconds(duration) {
    if (!duration) {
        return 0;
    }
    return TimeConversion.durationToMilliseconds(duration) / 1000;
}
export function countStatuses(statuses, predicate = () => true) {
    return Object.entries(statuses)
        .filter(([status]) => predicate(status))
        .reduce((prev, [, curr]) => prev + curr, 0);
}
export function formatStep(step, pickleStep, status) {
    let text = `${step.keyword.trim()} ${pickleStep.text.trim()}.`;
    do {
        text += '.';
    } while (text.length < 76);
    return text + status.toLowerCase();
}
export function formatTimestamp(testRunStarted) {
    if (!testRunStarted) {
        return undefined;
    }
    const millis = TimeConversion.timestampToMillisecondsSinceEpoch(testRunStarted.timestamp);
    return DateTime.fromMillis(millis, { zone: 'UTC' }).toISO({
        suppressMilliseconds: true,
    });
}
//# sourceMappingURL=helpers.js.map