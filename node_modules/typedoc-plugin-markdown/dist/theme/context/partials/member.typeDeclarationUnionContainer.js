import { codeBlock } from '../../../libs/markdown/code-block.js';
import { ReflectionType, UnionType } from 'typedoc';
export function typeDeclarationUnionContainer(model, options) {
    const md = [];
    if (model.type instanceof UnionType) {
        const useCodeBlocks = this.options.getValue('useCodeBlocks');
        const elementSummaries = model.type?.elementSummaries;
        model.type.types.forEach((type, i) => {
            if (type instanceof ReflectionType) {
                const typeOut = this.partials.someType(type, {
                    forceCollapse: true,
                });
                md.push(useCodeBlocks ? codeBlock(typeOut) : typeOut);
                md.push(this.partials.typeDeclarationContainer(model, type.declaration, options));
            }
            else {
                md.push(`${this.partials.someType(type)}`);
            }
            if (elementSummaries?.[i]) {
                md.push(this.helpers.getCommentParts(elementSummaries[i]));
            }
        });
    }
    return md.join('\n\n');
}
