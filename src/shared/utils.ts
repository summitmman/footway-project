import { IDataRecord } from "./interfaces";

const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
}
export const highlight = (search: string, value: any) => {
    if (search == null || search === '') {
        return value;
    }

    const escapedSearch = escapeRegex(search);
    if (['string', 'number'].includes(typeof value)) {
        return String(value).replace(new RegExp(escapedSearch, "gi"), match => `<mark>${match}</mark>`);
    }

    if (Array.isArray(value)) {
        return value.map(v => {
            if (['string', 'number'].includes(typeof v)) {
                return String(v).replace(new RegExp(escapedSearch, "gi"), match => `<mark>${match}</mark>`);
            }
            return v;
        });
    }
    return value;
};
export const updateArrayWithAnother = (srcArr: Array<IDataRecord>, targetArr: Array<IDataRecord>) => {
    const newMap = new Map<string|number, object>(srcArr.map((item: IDataRecord) => [item.id, item]));
    return targetArr.map(item => 
        newMap.has(item.id) ? { ...item, ...newMap.get(item.id) } : item
    );
};