import { useEffect, useRef, useState } from "react";
import { IColumnConfig, IDataRecord } from "../../shared/interfaces";
import { ControlType, HeaderType } from "../../shared/enums";
import { highlight } from '../../shared/utils';
import Search from "./Search";
import Filter from "./Filter";
import Dropdown from "../Dropdown";


interface ITableProps {
    data: Array<IDataRecord>;
    columns: Array<IColumnConfig>;
    groupActions?: any[];
}
enum CheckStatus {
    All = 'all',
    Some = 'some',
    None = 'none'
}

const Table = ({ data, columns, groupActions = [] }: ITableProps) => {
    const [originalData, setOriginalData] = useState(data);
    const [filteredData, setFilteredData] = useState(data);
    const editModal = useRef<any>(null);
    
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
            return originalData.filter(d => {
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

                // 3. Reset selection of records which did not make it to the filter
                const result = searchMatch && filterMatch
                if (!result) {
                    // directly changing the state as this will not affect any reactivity
                    d.__selected = false;
                }

                // 4. return the two filter results
                return result;
            });
        }

        return originalData;
    };
    useEffect(() => {
        setFilteredData(filterData());
    }, [search, filters, originalData]);

    // Functions
    // Toggle Type handling
    const toggleSwitch = (value: boolean, key: string, record: IDataRecord) => {
        setOriginalData(originalData.map(d => {
            if (d.id === record.id) {
                return {...record, [key]: value};
            }
            return d
        }));
    };
    // Toggle Record Select handling
    const toggleSelect = (value: boolean, id: string | number, record: IDataRecord) => {
        setOriginalData(originalData.map(d => {
            if (d.id === id) {
                return {...record, __selected: value};
            }
            return d
        }));
    };
    const selectedRecords = originalData.filter(d => d.__selected);
    const checkStatus =
        selectedRecords.length
            ? (selectedRecords.length === filteredData.length ? CheckStatus.All : CheckStatus.Some)
            : CheckStatus.None;
    const ariaChecked = checkStatus === CheckStatus.All ? 'true' : (checkStatus === CheckStatus.None ? 'false' : 'mixed');
    const toggleTopSelect = () => {
        if (checkStatus === CheckStatus.None) {
            // if none selected, select all
            setOriginalData(originalData.map(d => {
                return {...d, __selected: true};
            }));
        } else if (checkStatus === CheckStatus.All || checkStatus === CheckStatus.Some) {
            setOriginalData(originalData.map(d => {
                return {...d, __selected: false};
            }));
        }

    }

    const [editValue, setEditValue] = useState<any | null>('');
    const [editRecord, setEditRecord] = useState<IDataRecord | null>(null);
    const [editColumnConfig, setEditColumnConfig] = useState<IColumnConfig | null>(null);
    const onEditableClick = (record: IDataRecord, columnConfig: IColumnConfig) => {
        setEditRecord(record);
        setEditColumnConfig(columnConfig);
        setEditValue(record[columnConfig.key]);
        editModal.current?.showModal && editModal.current?.showModal();
    };
    const editModalCross = () => {
        setEditRecord(null);
        setEditColumnConfig(null);
        setEditValue('');
    };
    const editModalDone = (e: any) => {
        if (editRecord) {
            setOriginalData(originalData.map(d => {
                if (d.id === editRecord.id) {
                    return {
                        ...d,
                        [editColumnConfig!.key]: editValue
                    };
                }
                return d;
            }));
        } else if (selectedRecords.length) {
            const newData = selectedRecords.map(d => {
                return { ...d, [editColumnConfig!.key]: editValue };
            });
            const newMap = new Map<string|number, object>(newData.map((item: IDataRecord) => [item.id, item]));
            const newDataset = originalData.map(item => 
                newMap.has(item.id) ? { ...item, ...newMap.get(item.id) } : item
            );
            setOriginalData(newDataset);
        }
        // We can also perform validations here and if validation fails
        // we can avoid closing the dialog
        // e.prevenDefault();
        setEditRecord(null);
        setEditColumnConfig(null);
        setEditValue('');
    };
    const onGroupAction = (option: any) => {
        if (!option) {
            return;
        }

        if (typeof option.value === 'function') {
            const newData = option.value(selectedRecords);
            const newMap = new Map<string|number, object>(newData.map((item: IDataRecord) => [item.id, item]));
            const newDataset = originalData.map(item => 
                newMap.has(item.id) ? { ...item, ...newMap.get(item.id) } : item
            );
            setOriginalData(newDataset);
        } else if (option.value.type === 'RequestNewValue') {
            const config = columns.find(c => c.key === option.value.column);
            setEditRecord(null);
            setEditColumnConfig(config ?? null);
            setEditValue('');
            config && editModal.current?.showModal && editModal.current?.showModal();
        }
    };

    return (
        <div>
            <div className="actions mb-2 flex gap-4 ">
                <Search onSearch={(v) => setSearch(v)} />
                { groupActions?.length && (
                    <Dropdown data={groupActions} onChange={onGroupAction} value={null} label={() => 'Bulk Actions'} disabled={checkStatus === CheckStatus.None} />
                ) }
                <Filter columns={columns} data={originalData} onFilterChange={v => setFilters(v)} />
            </div>
            <div className="overflow-auto" style={{height: '60vh'}}>
                <table className="table table-lg table-pin-rows table-pin-cols">
                    <thead>
                        <tr>
                            <th><a className="checkbox checkbox-primary inline-block" aria-checked={ariaChecked} onClick={toggleTopSelect}></a></th>
                            {
                                columns.map(column => (<th key={column.title}>
                                    { column.editable && (
                                        <svg width="10" height="10" viewBox="0 0 48 48" className="w-4 h-4 inline-block" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7 42H43" stroke="currentColor" strokeWidth="4" strokeLinecap="butt" strokeLinejoin="bevel"></path>
                                            <path d="M11 26.7199V34H18.3172L39 13.3081L31.6951 6L11 26.7199Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="bevel"></path>
                                        </svg>)}
                                    { column.title }
                                </th>))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            filteredData.slice(0, 20).map(record => (
                                <tr key={record.id} className="hover">
                                    <td><input type="checkbox" className="checkbox checkbox-primary" checked={ !!record.__selected } onChange={() => toggleSelect(!record.__selected, record.id, record)} /></td>
                                    {
                                        columns.map(column => {
                                            if (column.editable && column.control === ControlType.Switch) {
                                                return <td key={column.key + record.id}><input type="checkbox" className="toggle toggle-primary" checked={ !!record[column.key] } onChange={() => toggleSwitch(!record[column.key], column.key, record)} /></td>;
                                            }
                                            if (column.editable) {
                                                return <td key={column.key + record.id}><a className="cursor-pointer hover:text-primary" onClick={() => onEditableClick(record, column)} dangerouslySetInnerHTML={{__html: highlight(search, record[column.key])}}></a></td>
                                            }
                                            return <td key={column.key + record.id} dangerouslySetInnerHTML={{__html: highlight(search, record[column.key])}}></td>
                                        })
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
            <dialog id="my_modal_3" className="modal" ref={editModal}>
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={editModalCross}>✕</button>
                    </form>
                    <h3 className="font-bold text-lg">{editColumnConfig?.title}</h3>
                    <p className="py-4">
                        <input type="text" placeholder={`Enter ${editColumnConfig?.title}`} className="input input-bordered w-full max-w-xs" value={editValue} onInput={(e) => setEditValue((e.target as any).value)} />
                    </p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn" onClick={editModalDone}>Done</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    );
}

export default Table