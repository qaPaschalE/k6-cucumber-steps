import { Envelope } from '@cucumber/messages';
declare const _default: {
    type: string;
    formatter({ options, on, write, }: {
        options: {
            suiteName?: string;
        };
        on: (type: "message", handler: (message: Envelope) => void) => void;
        write: (content: string) => void;
    }): void;
    optionsKey: string;
};
export default _default;
//# sourceMappingURL=index.d.ts.map