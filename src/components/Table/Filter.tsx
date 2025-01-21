import { useEffect, useRef, useState } from "react";
import { IColumnConfig, IDataRecord, IOption } from "../../shared/interfaces";

interface IFilterProps {
    data: Array<IDataRecord>;
    columns: Array<IColumnConfig>;
    onFilterChange?: (filters: {[key: string]: Array<string|number|boolean>}) => void;
}
interface ICheckboxOption extends IOption {
    checked: boolean;
}

const Filter = ({ columns, data, onFilterChange }: IFilterProps) => {
    const filterEl = useRef(null);

    // 1. Filter column configs
    // get columns we are concerned with
    const [filterColumns] = useState<Array<IColumnConfig>>(
        columns.filter(column => column.key && (column.filter === true || (column.filter && column.filter.length)))
    );
    // if there are no filters, then dont render the filter button
    if (!filterColumns.length) {
        return null;
    }

    // 2. Filter column options
    const [filterOptions, setFilterOptions] = useState<{[key: string]: Array<ICheckboxOption>}>(filterColumns.reduce((acc, col) => {
        return ({
            ...acc,
            [col.key]: Array.isArray(col.filter) ? col.filter.map(item => ({ label: item, value: item, checked: false })): [],
        });
    }, {}));
    const populateFilterOptions = () => {
        // we only need to populate the filters which are "true" and the array is not already provided
        const uniqueSets: {[key: string]: Set<any>} = filterColumns
            .filter(col => (col.filter && Array.isArray(col.filter) && !col.filter.length) || col.filter === true)
            .reduce((acc, col) => {
                return ({
                    ...acc,
                    [col.key]: new Set()
                });
            }, {});
        const keys = Object.keys(uniqueSets);
        // if there are not such filters, then no need of processing further
        if (!keys.length) {
            return;
        }

        // create unique sets of each value
        data.forEach((d) => {
            keys.forEach((key) => {
                let v = d[key];
                if (Array.isArray(v)) {
                    v.forEach(nd => {
                        uniqueSets[key].add(nd);
                    });
                } else {
                    uniqueSets[key].add(v);
                }
            });
        });

        // set populated value, convert set to array
        const options: {[key: string]: Array<ICheckboxOption>} = {};
        keys.forEach(key => {
            options[key] = Array.from(uniqueSets[key]).map(v => ({label: v, value: v, checked: false}));
        });
        setFilterOptions({
            ...filterOptions,
            ...options
        });
    };
    useEffect(() => {
        populateFilterOptions();
    }, []);

    // 3. Select one of the filter columns to show
    const [selectedFilterColumn, setSelectedFilterColumn] = useState(filterColumns[0]);

    // 4. Actual filter values selected
    const [filterValues, setFilterValues] = useState<{[key: string]: Set<any>}>({});
    useEffect(() => {
        setFilterValues(Object.keys(filterOptions).reduce((acc, key) => {
            return {
                ...acc,
                [key]: new Set(filterOptions[key].filter(option => option.checked).map(option => option.value))
            };
        }, {}))
    }, [filterOptions]);
    const noOfFilters = Object.keys(filterValues).reduce((acc, key) => acc + Number(!!filterValues[key].size), 0);
    

    // 5. Filter select interaction
    const onFilterCheck = (isChecked: boolean, option: ICheckboxOption, key: string, index: number) => {
        setFilterOptions({
            ...filterOptions,
            [key]: filterOptions[key].map((o, i) => {
                if (i === index) {
                    return {...option, checked: isChecked};
                }
                return o;
            })
        });
    };
    // 6. Send selected filters by event
    useEffect(() => {
        onFilterChange && onFilterChange(Object.keys(filterValues).reduce((acc, key) => {
            return {...acc, [key]: Array.from(filterValues[key])}
        }, {}))
    }, [filterValues]);

    // 7. clear filters
    const clearFilter = (key: string) => {
        setFilterOptions({
            ...filterOptions,
            [key]: filterOptions[key].map(option => ({
                    ...option,
                    checked: false
            }))
        })
    };
    const clearAllFilters = () => {
        setFilterOptions(Object.keys(filterOptions).reduce((acc, key) => {
            return {
                ...acc,
                [key]: filterOptions[key].map(option => ({
                    ...option,
                    checked: false
                }))
            };
        }, {}));
    };
    
    return (
        <div>
            {/* Trigger */}
            <button className="btn btn-primary" onClick={() => (filterEl.current as any).showModal()}>
                Filters
                {noOfFilters > 0 && <div className="badge">{noOfFilters}</div>}
            </button>
            {/* Filter Modal */}
            <dialog id="my_modal_1" className="modal" ref={filterEl}>
                <div className="modal-box rounded-none fixed top-0 bottom-0 right-0 max-h-screen p-0">
                    {/* Header */}
                    <div className="flex justify-between px-4 pt-2">
                        <h3 className="font-bold text-lg">Filters</h3>
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost">✕</button>
                        </form>
                    </div>
                    {/* Filter Section */}
                    <div className="flex mt-4">
                        {/* Filter Categories */}
                        <div className="w-[40%]">
                            {filterColumns.map(
                                col => (
                                    <button
                                        className={
                                            `hover:bg-base-200 p-4 w-full text-left font-bold flex justify-between ${col.key === selectedFilterColumn.key ? 'bg-base-200' : ''}`
                                        }
                                        key={col.title}
                                        onClick={() => setSelectedFilterColumn(col)}
                                    >
                                        <div className="break-words">{col.title}</div>
                                        {filterValues[col.key]?.size > 0 && <div className="badge badge-primary">{filterValues[col.key].size}</div>}
                                    </button>)
                            )}
                            <div className="p-5">
                                <button className="btn w-full" onClick={() => clearAllFilters()}>Clear All</button>
                            </div>
                        </div>
                        {/* Filter Category Values; checkboxes */}
                        <div className="flex-grow px-4">
                            <div className="flex items-center justify-between">
                                <div className="font-bold text-primary">{selectedFilterColumn.title}</div>
                                <button className="btn" onClick={() => clearFilter(selectedFilterColumn.key)}>Clear</button>
                            </div>
                            <div className="overflow-y-auto modal-section-height mt-4">
                                {filterOptions[selectedFilterColumn.key].map((option, index) => (<div key={option.label} className="form-control">
                                    <label className="label cursor-pointer justify-normal gap-4">
                                        <input type="checkbox" className="checkbox" checked={option.checked} onChange={() => onFilterCheck(!option.checked, option, selectedFilterColumn.key, index)}/>
                                        <span className="label-text">{option.label}</span>
                                    </label>
                                </div>))}
                            </div>
                        </div>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>Close</button>
                </form>
            </dialog>
        </div>
    );
}

export default Filter