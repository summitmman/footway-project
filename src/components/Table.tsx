import { useEffect, useRef, useState } from "react";
import { IColumnConfig } from "../shared/interfaces";
import { HeaderType } from "../shared/enums";
import Dropdown, { IOption } from "./Dropdown";

interface ITableProps {
    data: Array<Record<string, any>>;
    columns: Array<IColumnConfig>;
}

const Table = ({ data, columns }: ITableProps) => {
    const [search, setSearch] = useState('');
    
    const [filterables, setFilterables] = useState<Array<any>>(
        columns
            .filter(column => (column.filter === true || (column.filter && column.filter.length)))
            .map(column => ({...column, label: column.title, value: column.key, values: []}))
    );
    const [filters, setFilters] = useState<any>({});
    const filterEl = useRef(null);
    
    const [filteredData, setFilteredData] = useState(data);
    useEffect(() => {
        setFilterables(filterables.map(filterable => {
            return {
                ...filterable,
                options: [
                    {
                        label: 'New Era',
                        value: 'New Era'
                    },
                    {
                        label: 'Retrosuperfuture',
                        value: 'Retrosuperfuture'
                    }
                ]
            };
        }))
        setFilteredData(data);
    }, [data]);
    

    const filterData = () => {
        let localData = data;
        const filterKeys = Object.keys(filters);
        
        if (search || filterKeys.length && filterKeys.filter(key => filters[key].length).length) {
            localData = localData.filter(d => {
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
                
                let filterMatch = false;
                if (filterKeys.length && filterKeys.filter(key => filters[key].length).length) {
                    const keys = filterKeys;
                    for (let i = 0; i < keys.length; i++) {
                        const key = keys[i];
                        const match = filters[key].includes(d[key]);
                        if (match) {
                            filterMatch = true;
                        }
                    }
                } else {
                    filterMatch = true
                }

                return searchMatch && filterMatch;
            });
        }

        return localData;
    };
    useEffect(() => {
        setFilteredData(filterData());
    }, [search, filters]);

    const handleSearch = (event: any) => {
        setSearch(event.target.value);
    };

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

    const onFilterCheck = (value, filterable) => {
        const localFilters = {...filters};
        console.log(localFilters[filterable.key]);
        if (!localFilters[filterable.key]) {
            localFilters[filterable.key] = [];
        }
        localFilters[filterable.key] = [...(localFilters[filterable.key]), value];
        setFilters(localFilters);
    };

    return (
        <div>
            <div className="actions mb-2 flex gap-4 ">
                <label className="input input-bordered flex items-center gap-2 flex-grow">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-4 w-4 opacity-70"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <input type="text" className="grow" placeholder="Search" value={search} onInput={handleSearch} />
                </label>
                <button className="btn btn-primary" onClick={() => (filterEl.current as any).showModal()}>Filters</button>
                <dialog id="my_modal_1" className="modal" ref={filterEl}>
                    <div className="modal-box fixed top-0 bottom-0 right-0">
                        <h3 className="font-bold text-lg">Filters</h3>
                        {filterables.map(filterable => (
                            <div key={filterable.label}>
                                <h4 className="font-bold text-lg">{filterable.label}</h4>
                                <div>
                                    {filterable.options?.map(option => (<div key={option.label} className="form-control">
                                        <label className="label cursor-pointer justify-normal gap-4">
                                            <input type="checkbox" className="checkbox" value={option.value} onChange={() => onFilterCheck(option.value, filterable)}/>
                                            <span className="label-text">{option.label}</span>
                                        </label>
                                    </div>))}
                                </div>
                            </div>
                        ))}
                        <div className="modal-action">
                            <form method="dialog">
                                {/* if there is a button in form, it will close the modal */}
                                <button className="btn">Close</button>
                            </form>
                        </div>
                    </div>
                </dialog>
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