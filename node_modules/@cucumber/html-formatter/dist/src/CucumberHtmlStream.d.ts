import * as messages from '@cucumber/messages';
import { Transform, TransformCallback } from 'stream';
export declare class CucumberHtmlStream extends Transform {
    private readonly cssPath;
    private readonly jsPath;
    private readonly iconPath;
    private template;
    private preMessageWritten;
    private postMessageWritten;
    private firstMessageWritten;
    /**
     * @param cssPath
     * @param jsPath
     * @param iconPath
     */
    constructor(cssPath?: string, jsPath?: string, iconPath?: string);
    _transform(envelope: messages.Envelope, encoding: string, callback: TransformCallback): void;
    _flush(callback: TransformCallback): void;
    private writePreMessageUnlessAlreadyWritten;
    private writePostMessage;
    private writeFile;
    private writeTemplateBetween;
    private readTemplate;
    private writeMessage;
}
//# sourceMappingURL=CucumberHtmlStream.d.ts.map