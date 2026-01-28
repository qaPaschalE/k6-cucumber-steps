"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("should");
const indentStyleText_1 = require("./indentStyleText");
const styleText_1 = require("./styleText");
describe('indentStyleText', () => {
    it('leaves text unstyled', () => {
        indentStyleText_1.indentStyleText(0, 'some text').should.eql('some text');
    });
    it('trims text on the right', () => {
        indentStyleText_1.indentStyleText(0, ' \t some text   ').should.eql(' \t some text');
    });
    it('indents text', () => {
        indentStyleText_1.indentStyleText(2, 'some text').should.eql('  some text');
    });
    it('indents and trims text on the right', () => {
        indentStyleText_1.indentStyleText(2, '   some text   ').should.eql('     some text');
    });
    it('trims multiline text', () => {
        indentStyleText_1.indentStyleText(0, ' \t \n   some  \t  \n   \t  more text  \n ').should.eql('\n   some\n   \t  more text\n');
    });
    it('indents multiline text', () => {
        indentStyleText_1.indentStyleText(3, ' \n   some    \n   \t  more text  \n  ').should.eql('\n      some\n      \t  more text\n');
    });
    it("doesn't indent only whitespace-lines", () => {
        indentStyleText_1.indentStyleText(3, '\n  \n  \t').should.eql('\n\n');
    });
    it('applies styles to the text', () => {
        indentStyleText_1.indentStyleText(0, 'some text', ['red']).should.eql(styleText_1.styleText('some text', 'red'));
    });
    it('applies styles separately to lines', () => {
        indentStyleText_1.indentStyleText(0, 'some text\nmore text', ['red']).should.eql(`${styleText_1.styleText('some text', 'red')}\n${styleText_1.styleText('more text', 'red')}`);
    });
    it('applies styles separately to indented lines', () => {
        indentStyleText_1.indentStyleText(2, 'some text\nmore text', ['red']).should.eql(`  ${styleText_1.styleText('some text', 'red')}\n  ${styleText_1.styleText('more text', 'red')}`);
    });
});
//# sourceMappingURL=indentStyleText.spec.js.map