import { useEffect, useState } from "react";
import { IColumnConfig, IDataRecord } from "../../../shared/interfaces";
import { HeaderType } from "../../../shared/enums";

interface IUseFilterProps {
    originalRecords: Array<IDataRecord>;
    columnConfigs: Array<IColumnConfig>;
}

const useFilter = ({
    originalRecords,
    columnConfigs
}: IUseFilterProps) => {
    const [filteredRecords, setFilteredRecords] = useState(originalRecords);
    // 1. search
    const [search, setSearch] = useState('');
    // 2. filters
    const [filters, setFilters] = useState<{[key: string]: Array<string|number|boolean>}>({});
    
    // 3. filter dataset logic
    const filterData = () => {

        const filterKeys = Object.keys(filters);
        const hasFilter = filterKeys.length && filterKeys.find(key => filters[key].length);
        
        // process only if there is something to filter, search or filters
        if (search || hasFilter) {
            // loop through all records
            return originalRecords.filter(record => {
                // 1. free text search
                let searchMatch = false;
                if (search) {
                    for (let i = 0; i < columnConfigs.length; i++) {
                        const column = columnConfigs[i];
                        if (
                            (
                                column.type === HeaderType.String
                                || column.type === HeaderType.Number
                            )
                            && String(record[column.key]).toLowerCase().includes(search.toLowerCase())
                        ) {
                            searchMatch = true;
                            break;
                        }
                        if (column.type === HeaderType.StringArray) {
                            const values = record[column.key];
                            for (let j = 0; j < values.length; j++) {
                                if (String(values[j]).toLowerCase().includes(search.toLowerCase())) {
                                    searchMatch = true;
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    searchMatch = true;
                }
                
                // 2. filter match
                let filterMatch = true;
                if (hasFilter) {
                    const keys = filterKeys;
                    for (let i = 0; i < keys.length; i++) {
                        const key = keys[i];
                        if (!filters[key].length) {
                            continue;
                        }

                        const value = record[key];
                        if (Array.isArray(value)) {
                            const intersection = value.filter(item => filters[key].includes(item));
                            if (!intersection.length) {
                                filterMatch = false;
                                break;
                            }
                        } else {
                            const match = filters[key].includes(value);
                            if (!match) {
                                filterMatch = false;
                                break;
                            }
                        }
                    }
                }

                // 3. Reset selection of records which did not make it to the filter
                const result = searchMatch && filterMatch
                if (!result) {
                    // directly changing the state as this will not affect any reactivity
                    record.__selected = false;
                }

                // 4. return the two filter results
                return result;
            });
        }

        return originalRecords;
    };
    useEffect(() => {
        setFilteredRecords(filterData());
    }, [search, filters, originalRecords]);

    return {
        filteredRecords,
        search,
        setSearch,
        setFilters
    };
};

export default useFilter;