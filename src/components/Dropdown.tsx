import { useEffect, useRef, useState } from "react";
import { IOption } from "../shared/interfaces";

export interface IDropdownProps<V=any, D=any> {
    data: IOption<V, D>[];
    onChange: (option: IOption | null) => void;
    label?: (option: IOption | null) => string;
    value: V;
    disabled?: boolean;
}

const Dropdown = ({ data, onChange, label, value, disabled }: IDropdownProps) => {

    const [option, setOption] = useState<IOption | null>(null);
    const [triggeredChange, setTriggeredChange] = useState(false);
    const updateOptionState = (o: IOption | null) => {
        setOption(o);
        setTriggeredChange(true);
        onChange(o);
        (el.current as any)?.blur && (el.current as any).blur();
    };
    const el = useRef(null);

    // initial State
    useEffect(() => {
        // if value is not initialized, do nothing
        // if value is present
        if (value != null) {
            // check if it matches existing options
            const initialOption = data.find((item) => item.value === value);
            // if it does not then emit null
            if (initialOption === undefined) {
                updateOptionState(null);
            } else {
                // if it does then set option to it
                setOption(initialOption);
            }
        }
    }, []);
    // other than initial state can change if we emit or if user sets it from parent
    useEffect(() => {
        // if we had emitted do nothing and reset flag
        // if we had not emitted and the value is different from our option state
        // then set it and emit new option again
        if (!triggeredChange && value !== option?.value) {
            const expectedOption = data.find((item) => item.value === value);
            updateOptionState(expectedOption ?? null);
        } else {
            setTriggeredChange(false);
        }
    }, [value]);

    return (
        <div className="dropdown">
            <button tabIndex={0} role="button" className="btn btn-primary" disabled={disabled}>{label ? label(option) : (option?.label ?? null)}</button>
            <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[2] w-52 p-2 shadow max-h-60 overflow-y-auto flex-nowrap"
                ref={el}
            >
                {data.map(o => <li key={o.label}><a onClick={() => updateOptionState(o)}>{o.label}</a></li>)}
            </ul>
        </div>
    );
}

export default Dropdown