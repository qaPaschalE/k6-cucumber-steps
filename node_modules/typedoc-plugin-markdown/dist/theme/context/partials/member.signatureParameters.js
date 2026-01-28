import { backTicks } from '../../../libs/markdown/index.js';
export function signatureParameters(model, options) {
    const format = this.options.getValue('useCodeBlocks');
    const firstOptionalParamIndex = model.findIndex((parameter) => parameter.flags.isOptional);
    return ('(' +
        model
            .map((param, i) => {
            const paramsmd = [];
            if (param.flags?.isRest) {
                paramsmd.push('...');
            }
            const paramType = this.partials.someType(param.type);
            const showParamType = (options?.forceExpandParameters ?? false) ||
                this.options.getValue('expandParameters');
            const optional = param.flags.isOptional ||
                (firstOptionalParamIndex !== -1 && i > firstOptionalParamIndex)
                ? '?'
                : '';
            const paramItem = [`${backTicks(`${param.name}${optional}`)}`];
            if (showParamType) {
                paramItem.push(paramType);
            }
            paramsmd.push(`${format && model.length > 2 ? `\n   ` : ''}${paramItem.join(': ')}`);
            return paramsmd.join('');
        })
            .join(`, `) +
        ')');
}
