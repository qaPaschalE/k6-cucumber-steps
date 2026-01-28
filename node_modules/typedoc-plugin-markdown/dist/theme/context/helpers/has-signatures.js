export function hasSignatures(model) {
    return (!model.type?.declaration?.children?.length &&
        (Boolean(model.signatures?.length) ||
            Boolean(model.type?.declaration?.signatures?.length)));
}
