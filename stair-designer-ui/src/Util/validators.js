export const isInFeetOrInches = (input) => {
    if (input && input.includes != undefined) {
        return (input.includes('"') || input.includes('\''));
    }
    return false;
}