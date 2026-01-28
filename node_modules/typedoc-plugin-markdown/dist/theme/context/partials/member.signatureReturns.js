import { heading } from '../../../libs/markdown/index.js';
import { i18n, UnionType, } from 'typedoc';
export function signatureReturns(model, options) {
    const md = [];
    const typeDeclaration = model.type
        ?.declaration;
    md.push(heading(options.headingLevel, i18n.theme_returns()));
    if (!typeDeclaration?.signatures) {
        if (model.type && this.helpers.hasUsefulTypeDetails(model.type)) {
            if (model.type instanceof UnionType) {
                md.push(this.partials.typeDeclarationUnionContainer(model, options));
            }
        }
        else {
            md.push(this.helpers.getReturnType(model.type));
        }
    }
    const returnsTag = model.comment?.getTag('@returns');
    if (returnsTag) {
        md.push(this.helpers.getCommentParts(returnsTag.content));
    }
    if (typeDeclaration?.signatures) {
        typeDeclaration.signatures.forEach((signature) => {
            md.push(this.partials.signature(signature, {
                headingLevel: options.headingLevel + 1,
                nested: true,
            }));
        });
    }
    if (typeDeclaration?.children) {
        md.push(this.partials.typeDeclaration(typeDeclaration, {
            headingLevel: options.headingLevel,
        }));
    }
    return md.join('\n\n');
}
