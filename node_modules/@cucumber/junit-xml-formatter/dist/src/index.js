import { Query } from '@cucumber/query';
import xmlbuilder from 'xmlbuilder';
import { makeReport } from './makeReport.js';
export default {
    type: 'formatter',
    formatter({ options, on, write, }) {
        const query = new Query();
        const builder = xmlbuilder
            .create('testsuite', { invalidCharReplacement: '' })
            .att('name', options.suiteName || 'Cucumber');
        on('message', (message) => {
            query.update(message);
            if (message.testRunFinished) {
                const testSuite = makeReport(query);
                builder.att('time', testSuite.time);
                builder.att('tests', testSuite.tests);
                builder.att('skipped', testSuite.skipped);
                builder.att('failures', testSuite.failures);
                builder.att('errors', testSuite.errors);
                if (testSuite.timestamp) {
                    builder.att('timestamp', testSuite.timestamp);
                }
                for (const testCase of testSuite.testCases) {
                    const testcaseElement = builder.ele('testcase', {
                        classname: testCase.classname,
                        name: testCase.name,
                        time: testCase.time,
                    });
                    if (testCase.failure) {
                        const failureElement = testcaseElement.ele(testCase.failure.kind);
                        if (testCase.failure.kind === 'failure' && testCase.failure.type) {
                            failureElement.att('type', testCase.failure.type);
                        }
                        if (testCase.failure.message) {
                            failureElement.att('message', testCase.failure.message);
                        }
                        if (testCase.failure.stack) {
                            failureElement.cdata(testCase.failure.stack);
                        }
                    }
                    if (testCase.output) {
                        testcaseElement.ele('system-out').cdata(testCase.output);
                    }
                }
                write(builder.end({ pretty: true }));
            }
        });
    },
    optionsKey: 'junit',
};
//# sourceMappingURL=index.js.map