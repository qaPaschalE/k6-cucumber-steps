import { Query } from '@cucumber/query';
interface ReportSuite {
    time: number;
    tests: number;
    skipped: number;
    failures: number;
    errors: number;
    testCases: ReadonlyArray<ReportTestCase>;
    timestamp?: string;
}
interface ReportTestCase {
    classname: string;
    name: string;
    time: number;
    failure?: ReportFailure;
    output: string;
}
interface ReportFailure {
    kind: 'failure' | 'skipped';
    type?: string;
    message?: string;
    stack?: string;
}
export declare function makeReport(query: Query): ReportSuite;
export {};
//# sourceMappingURL=makeReport.d.ts.map