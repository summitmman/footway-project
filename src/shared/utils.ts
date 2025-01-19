const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
}
export const highlight = (search: string, value: any) => {
    if (search == null || search === '') {
        return value;
    }

    if (['string', 'number'].includes(typeof value)) {
        const escapedSearch = escapeRegex(search);
        return String(value).replace(new RegExp(escapedSearch, "gi"), match => `<mark>${match}</mark>`);
    }
    return value;
};