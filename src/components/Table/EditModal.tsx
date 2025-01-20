import { useEffect, useRef, useState } from "react";
import { HeaderType } from "../../shared/enums";
import { IColumnConfig, IDataRecord } from "../../shared/interfaces";

interface IEditModalProps {
    value?: string | number | boolean;
    columnConfig: IColumnConfig;
    record?: IDataRecord | null;
    onCross: (elRef: any) => void;
    onDone: (
        v: string | number | boolean,
        r: IDataRecord | undefined | null,
        columnConfig: IColumnConfig,
        elRef: any
    ) => void;
}
const EditModal = ({ value='', columnConfig, record, onCross, onDone }: IEditModalProps) => {
    const modalRef = useRef<any>(null);
    const inputRef = useRef<any>(null);
    const [editValue, setEditValue] = useState<any | null>(value);

    useEffect(() => {
        modalRef.current.showModal();
        inputRef.current.focus();
        // for cases when user presses Esc for closing the dialog
        modalRef.current.addEventListener('close', () => {
            onCross(modalRef)
        });
    }, []);

    const onCrossClick = (e: any) => {
        e.preventDefault();
        onCross(modalRef);
    };
    const onDoneClick = (e: any) => {
        e.preventDefault();
        onDone(editValue, record, columnConfig, modalRef);
    };

    const handleInput = (e: any) => {
        let v = e.target.value;
        if (v != null) {
            if (columnConfig.type === HeaderType.Number) {
                v = Number(v);
            } else if (columnConfig.type === HeaderType.Boolean) {
                v = Boolean(v);
            }
        }
        setEditValue(v);
    };

    return (
        <dialog id="my_modal_3" className="modal" ref={modalRef}>
            <div className="modal-box">
                <div className="flex justify-between">
                    <h3 className="font-bold text-lg">{columnConfig.title}</h3>
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost right-2 top-2" onClick={onCrossClick}>✕</button>
                    </form>
                </div>
                <p className="py-4">
                    <form method="dialog" className="flex gap-4">
                        <input ref={inputRef} type={columnConfig.type === HeaderType.Number ? 'number' : 'text'} placeholder={`Enter ${columnConfig.title}`} className="input input-bordered w-full flex-grow" value={editValue} onInput={handleInput} />
                        <button className="btn btn-primary" onClick={onDoneClick}>Done</button>
                    </form>
                </p>
            </div>
        </dialog>
    );
}

export default EditModal