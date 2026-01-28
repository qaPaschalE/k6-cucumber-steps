"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("should");
const styleText_1 = require("./styleText");
describe('styleText()', () => {
    it('applies modifiers', () => {
        styleText_1.styleText('Burpless 26', 'bold').should.containEql('\u001b[1mBurpless 26\u001b[22m');
        styleText_1.styleText('Burpless 26', 'italic').should.containEql('\u001b[3mBurpless 26\u001b[23m');
    });
    it('applies foreground colors (red)', () => {
        styleText_1.styleText('Burpless 26', 'red').should.containEql('\u001b[31mBurpless 26\u001b[39m');
    });
    it('applies foreground colors (green)', () => {
        styleText_1.styleText('Burpless 26', 'green').should.containEql('\u001b[32mBurpless 26\u001b[39m');
    });
    it('applies foreground colors (blue)', () => {
        styleText_1.styleText('Burpless 26', 'blue').should.containEql('\u001b[34mBurpless 26\u001b[39m');
    });
    it('applies bright foreground colors (red)', () => {
        styleText_1.styleText('Burpless 26', 'redBright').should.containEql('\u001b[91mBurpless 26\u001b[39m');
    });
    it('applies bright foreground colors (green)', () => {
        styleText_1.styleText('Burpless 26', 'greenBright').should.containEql('\u001b[92mBurpless 26\u001b[39m');
    });
    it('applies bright foreground colors (blue)', () => {
        styleText_1.styleText('Burpless 26', 'blueBright').should.containEql('\u001b[94mBurpless 26\u001b[39m');
    });
    it('applies background colors (red)', () => {
        styleText_1.styleText('Burpless 26', 'bgRed').should.containEql('\u001b[41mBurpless 26\u001b[49m');
    });
    it('applies background colors (green)', () => {
        styleText_1.styleText('Burpless 26', 'bgGreen').should.containEql('\u001b[42mBurpless 26\u001b[49m');
    });
    it('applies background colors (blue)', () => {
        styleText_1.styleText('Burpless 26', 'bgBlue').should.containEql('\u001b[44mBurpless 26\u001b[49m');
    });
    it('applies bright background colors (red)', () => {
        styleText_1.styleText('Burpless 26', 'bgRedBright').should.containEql('\u001b[101mBurpless 26\u001b[49m');
    });
    it('applies bright background colors (green)', () => {
        styleText_1.styleText('Burpless 26', 'bgGreenBright').should.containEql('\u001b[102mBurpless 26\u001b[49m');
    });
    it('applies bright background colors (blue)', () => {
        styleText_1.styleText('Burpless 26', 'bgBlueBright').should.containEql('\u001b[104mBurpless 26\u001b[49m');
    });
    it('combines modifiers, foreground and background colors', () => {
        styleText_1.styleText('Burpless 26', 'redBright', 'bgBlueBright', 'bold').should.containEql('\u001b[91m\u001b[104m\u001b[1mBurpless 26\u001b[22m\u001b[49m\u001b[39m');
    });
    it('fails with a clear error on unknown styles', () => {
        ;
        (() => 
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        styleText_1.styleText('Burpless 26', 'ultraviolet')).should.throwError('Unknown style "ultraviolet"');
    });
});
//# sourceMappingURL=styleText.spec.js.map