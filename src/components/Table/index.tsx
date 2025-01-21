import { useRef, useState } from "react";
import { GroupAction, IColumnConfig, IDataRecord, IOption } from "../../shared/interfaces";
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
    groupActions?: Array<IOption<GroupAction>>;
    onEdit?: (data: Array<IDataRecord>) => void;
}

const Table = ({ data, columns, groupActions = [], onEdit }: ITableProps) => {
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
        setOriginalRecords: setOriginalData,
    });

    // Edit Column
    const {
        showEditModal,
        editModalProps,
        setEditModalProps,
        setShowEditModal,
        editModalCross,
        editModalDone,
        onEditableClick,
        toggleSwitch
    } = useEdit({
        originalRecords: originalData,
        setOriginalRecords: setOriginalData,
        selectedRecords,
        onEdit
    });

    // Bulk Actions
    const { onGroupAction } = useBulkActions({
        columnConfigs: columns,
        editModalProps,
        setEditModalProps,
        originalRecords: originalData,
        selectedRecords,
        setOriginalRecords: setOriginalData,
        showEditModal: setShowEditModal,
        onEdit
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
                <table className="table table-lg table-pin-rows w-full">
                    <thead>
                        <tr>
                            <th><a type="checkbox" className="checkbox checkbox-primary inline-block" aria-checked={ariaCheckedStatus} onClick={toggleAllSelect}></a></th>
                            {
                                columns.map(column => (<th key={column.title} className={column.cellClassName ?? ''}>
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
                        {!filteredRecords.length && <tr><td colSpan={columns.length + 1} className="text-center">No Records found</td></tr>}
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
                                                const value = column.value ? column.value(record, rowIndex) : record[column.key];
                                                if (column.component) {
                                                    return <td key={column.key + record.id} className={column.cellClassName ?? ''}>{column.component(record, highlight(search, value), rowIndex)}</td>
                                                }
                                                if (column.editable && column.control === ControlType.Switch) {
                                                    return <td key={column.key + record.id} className={column.cellClassName ?? ''}><input type="checkbox" className="toggle toggle-primary" checked={ !!value } onChange={() => toggleSwitch(!value, column.key, record)} /></td>;
                                                }
                                                if (column.editable) {
                                                    return (<td key={column.key + record.id} className={column.cellClassName ?? ''}>
                                                        <a className="group cursor-pointer hover:text-primary" onClick={() => onEditableClick(record, column)}>
                                                            { value == null ? <div className="badge badge-neutral group-hover:badge-primary">no value</div> : <div dangerouslySetInnerHTML={{__html: highlight(search, value)}}></div> }
                                                        </a>
                                                    </td>);
                                                }
                                                return <td key={column.key + record.id} className={column.cellClassName ?? ''} dangerouslySetInnerHTML={{__html: highlight(search, value)}}></td>
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