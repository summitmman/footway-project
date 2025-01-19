import { useEffect, useRef, useState } from "react";
import { IColumnConfig } from "../../shared/interfaces";
import { HeaderType } from "../../shared/enums";
import Search from "./Search";
import Filter from "./Filter";

interface ITableProps {
    data: Array<Record<string, any>>;
    columns: Array<IColumnConfig>;
}

const Table = ({ data, columns }: ITableProps) => {
    const [filteredData, setFilteredData] = useState(data);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState<{[key: string]: Array<string|number|boolean>}>({});
    
    const filterData = () => {
        let localData = data;
        const filterKeys = Object.keys(filters);
        
        // process only if there is something to filter
        const hasFilter = filterKeys.length && filterKeys.find(key => filters[key].length);
        if (search || hasFilter) {
            localData = localData.filter(d => {
                // free text search
                let searchMatch = false;
                if (search) {
                    for (let i = 0; i < columns.length; i++) {
                        const column = columns[i];
                        if (
                            (
                                column.type === HeaderType.String
                                || column.type === HeaderType.Number
                            )
                            && String(d[column.key]).toLowerCase().includes(search.toLowerCase())
                        ) {
                            searchMatch = true;
                            break;
                        }
                    }
                } else {
                    searchMatch = true;
                }
                
                let filterMatch = true;
                if (hasFilter) {
                    const keys = filterKeys;
                    for (let i = 0; i < keys.length; i++) {
                        const key = keys[i];
                        if (!filters[key].length) {
                            continue;
                        }
                        const match = filters[key].includes(d[key]);
                        if (!match) {
                            filterMatch = false;
                        }
                    }
                }

                return searchMatch && filterMatch;
            });
        }

        return localData;
    };
    useEffect(() => {
        setFilteredData(filterData());
    }, [search, filters]);

    const escapeRegex = (str: string) => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
    }
    const highlight = (value: any) => {
        if (search == null || search === '') {
            return value;
        }

        if (['string', 'number'].includes(typeof value)) {
            const escapedSearch = escapeRegex(search);
            return String(value).replace(new RegExp(escapedSearch, "gi"), match => `<mark>${match}</mark>`);
        }
        return value;
    };

    return (
        <div>
            <div className="actions mb-2 flex gap-4 ">
                <Search onSearch={(v) => setSearch(v)} />
                <Filter columns={columns} data={data} onFilterChange={v => setFilters(v)} />
            </div>
            <div className="overflow-auto" style={{height: '60vh'}}>
                <table className="table table-lg table-pin-rows table-pin-cols">
                    <thead>
                        <tr>
                            <th></th>
                            {
                                columns.map(column => <th key={column.title}>{ column.title }</th>)
                            }
                            <th>Enable</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredData.slice(0, 20).map(data => (
                                <tr key={data.id} className="hover">
                                    <td><input type="checkbox" className="checkbox checkbox-primary" /></td>
                                    {
                                        columns.map(column => <td key={column.key + data.id} dangerouslySetInnerHTML={{__html: highlight(data[column.key])}}></td>)
                                    }
                                    <td><input type="checkbox" className="toggle toggle-primary" defaultChecked /></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Table