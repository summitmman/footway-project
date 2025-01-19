import { useEffect, useRef, useState } from "react";
import { IColumnConfig } from "../../shared/interfaces";
import { HeaderType } from "../../shared/enums";
import { highlight } from '../../shared/utils';
import Search from "./Search";
import Filter from "./Filter";

interface ITableProps {
    data: Array<Record<string, any>>;
    columns: Array<IColumnConfig>;
}

const Table = ({ data, columns }: ITableProps) => {
    const [filteredData, setFilteredData] = useState(data);
    
    // 1. search
    const [search, setSearch] = useState('');
    // 2. filters
    const [filters, setFilters] = useState<{[key: string]: Array<string|number|boolean>}>({});
    
    // 3. filter dataset logic
    const filterData = () => {
        // local copy of dataset
        let localData = data;

        const filterKeys = Object.keys(filters);
        const hasFilter = filterKeys.length && filterKeys.find(key => filters[key].length);
        
        // process only if there is something to filter, search or filters
        if (search || hasFilter) {
            // loop through all records
            localData = localData.filter(d => {
                // 1. free text search
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
                
                // 2. filter match
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

                // 3. merge the two filter results
                return searchMatch && filterMatch;
            });
        }

        return localData;
    };
    useEffect(() => {
        setFilteredData(filterData());
    }, [search, filters]);


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
                                        columns.map(column => <td key={column.key + data.id} dangerouslySetInnerHTML={{__html: highlight(search, data[column.key])}}></td>)
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