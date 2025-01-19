import { DebouncedFunc } from "lodash";
import debounce from "lodash.debounce";
import { useState } from "react";

interface ISearchProps {
    onSearch?: (v: string) => void;
    debounceTime?: number
}

const Search = ({ onSearch, debounceTime = 400 }: ISearchProps) => {
    const [search, setSearch] = useState('');
    let debouncedOnSearch: DebouncedFunc<(v: string) => void> | undefined;
    if (onSearch) {
        debouncedOnSearch = debounce(onSearch, debounceTime);
    }

    const handleSearch = (event: any) => {
        const value = event.target.value;
        setSearch(value);
        debouncedOnSearch && debouncedOnSearch(value);
    };

    return (
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
    );
}

export default Search