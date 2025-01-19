import { useEffect, useRef, useState } from "react";
import { IColumnConfig, IOption } from "../../shared/interfaces";

interface IFilterProps {
    data: Array<Record<string, any>>;
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
        columns.filter(column => (column.filter === true || (column.filter && column.filter.length)))
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
                uniqueSets[key].add(d[key]);
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
    }, [data]);
    useEffect(() => {
        populateFilterOptions();
    }, []);

    // 3. Select one of the filter columns to show
    const [selectedFilterColumn, setSelectedFilterColumn] = useState(filterColumns[0]);

    // 4. Actual filter values selected
    const [filterValues, setFilterValues] = useState<{[key: string]: Set<any>}>(filterColumns.reduce((acc, col) => {
        return ({
            ...acc,
            [col.key]: new Set(),
        });
    }, {}))
    const noOfFilters = Object.keys(filterValues).reduce((acc, key) => acc + Number(!!filterValues[key].size), 0);

    // 5. Filter select interaction
    const onFilterCheck = (option: ICheckboxOption, key: string, index: number) => {
        const newFilterValues = { ...filterValues };
        const newSet = new Set(filterValues[key]);
        const isChecked = !option.checked;
        if (isChecked) {
            newSet.add(option.value)
        } else {
            newSet.delete(option.value)
        }
        newFilterValues[key] = newSet;
        setFilterValues(newFilterValues);

        const newOptions = { ...filterOptions };
        newOptions[key][index] = { ...option, checked: isChecked };
        setFilterOptions(newOptions);
    };
    // 6. Send selected filters by event
    useEffect(() => {
        onFilterChange && onFilterChange(Object.keys(filterValues).reduce((acc, key) => {
            return {...acc, [key]: Array.from(filterValues[key])}
        }, {}))
    }, [filterValues]);
    
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
                        <div className="w-32">
                            {filterColumns.map(
                                col => (
                                    <button
                                        className={
                                            `hover:bg-base-200 p-4 w-full text-left font-bold flex justify-between ${col.key === selectedFilterColumn.key ? 'bg-base-200' : ''}`
                                        }
                                        key={col.title}
                                        onClick={() => setSelectedFilterColumn(col)}
                                    >
                                        {col.title}
                                        {filterValues[col.key].size > 0 && <div className="badge badge-primary">{filterValues[col.key].size}</div>}
                                    </button>)
                            )}
                        </div>
                        {/* Filter Category Values; checkboxes */}
                        <div className="overflow-y-auto modal-section-height flex-grow px-4">
                            <div>
                                {filterOptions[selectedFilterColumn.key].map((option, index) => (<div key={option.label} className="form-control">
                                    <label className="label cursor-pointer justify-normal gap-4">
                                        <input type="checkbox" className="checkbox" checked={option.checked} onChange={() => onFilterCheck(option, selectedFilterColumn.key, index)}/>
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