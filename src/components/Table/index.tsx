import { useRef, useState } from "react";
import { IAction, IColumnConfig, IDataRecord, IOption } from "../../shared/interfaces";
import { CheckStatus, ControlType } from "../../shared/enums";
import { highlight } from '../../shared/utils';
import Search from "./Search";
import Filter from "./Filter";
import Dropdown from "../Dropdown";
import EditModal from "./EditModal";
import { useBulkActions, useEdit, useFilter, useInfiniteScroll, useSelect } from "./hooks";

interface ITableProps {
    data: Array<IDataRecord>;
    columns: Array<IColumnConfig>;
    groupActions?: Array<IOption<Function | IAction>>;
}

const Table = ({ data, columns, groupActions = [] }: ITableProps) => {
    const [originalData, setOriginalData] = useState(data);
    const scrollableEl = useRef(null);
    const listRootEl = useRef(null);
    
    // Filtering
    const {
        setSearch,
        filteredRecords,
        setFilters,
        search,
    } = useFilter({
        originalRecords: originalData,
        columnConfigs: columns,
    });

    // Table Functions
    // Toggle Type handling
    const toggleSwitch = (value: boolean, key: string, record: IDataRecord) => {
        setOriginalData(originalData.map(d => {
            if (d.id === record.id) {
                return {...record, [key]: value};
            }
            return d
        }));
    };

    // Row selections
    const {
        toggleRowSelect,
        toggleAllSelect,
        selectedRecords,
        checkStatus,
        ariaCheckedStatus
    } = useSelect({
        filteredRecords,
        originalRecords: originalData,
        setOriginalRecords: setOriginalData
    });

    // Edit Column
    const {
        showEditModal,
        editModalProps,
        setEditModalProps,
        setShowEditModal,
        editModalCross,
        editModalDone,
        onEditableClick
    } = useEdit({
        originalRecords: originalData,
        setOriginalRecords: setOriginalData,
        selectedRecords
    });

    // Bulk Actions
    const { onGroupAction } = useBulkActions({
        columnConfigs: columns,
        editModalProps,
        setEditModalProps,
        originalRecords: originalData,
        selectedRecords,
        setOriginalRecords: setOriginalData,
        showEditModal: setShowEditModal
    });

    const scrollManagedIndexes = useInfiniteScroll({
        scrollRef: scrollableEl.current,
        totalRecords: filteredRecords.length,
        batchCount: 10,
        batchThresholdNumber: 7,
        listRootRef: listRootEl.current
    });

    return (
        <div>
            {/* Actions */}
            <div className="actions mb-2 flex gap-4 ">
                <Search onSearch={(v) => setSearch(v)} />
                { groupActions?.length && (
                    <Dropdown data={groupActions} onChange={onGroupAction} value={null} label={() => 'Bulk Actions'} disabled={checkStatus === CheckStatus.None} />
                ) }
                <Filter columns={columns} data={originalData} onFilterChange={v => setFilters(v)} />
            </div>
            {/* Table */}
            <div ref={scrollableEl} className="overflow-auto" style={{height: '60vh'}} >
                <table className="table table-lg table-pin-rows table-pin-cols">
                    <thead>
                        <tr>
                            <th><a type="checkbox" className="checkbox checkbox-primary inline-block" aria-checked={ariaCheckedStatus} onClick={toggleAllSelect}></a></th>
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
                    <tbody ref={listRootEl}>
                        {
                            scrollManagedIndexes.map(rowIndex => {
                                const record = filteredRecords[rowIndex];
                                if (!record) {
                                    return null;
                                }
                                return (
                                    <tr key={record.id} className="hover">
                                        <td><input type="checkbox" className="checkbox checkbox-primary" checked={ !!record.__selected } onChange={() => toggleRowSelect(!record.__selected, record.id, record)} /></td>
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
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
            {/* Edit Modal */}
            {
                showEditModal
                && editModalProps.columnConfig
                && (
                    <EditModal
                        value={editModalProps.value}
                        columnConfig={editModalProps.columnConfig}
                        record={editModalProps.record}
                        onCross={editModalCross}
                        onDone={editModalDone}
                    />
                )
            }
        </div>
    );
}

export default Table