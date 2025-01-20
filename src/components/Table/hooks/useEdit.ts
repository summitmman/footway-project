import { useState } from "react";
import { IColumnConfig, IDataRecord, IEditModalProps } from "../../../shared/interfaces";
import { updateArrayWithAnother } from "../../../shared/utils";

interface IUseEditProps {
    originalRecords: Array<IDataRecord>;
    setOriginalRecords: (records: Array<IDataRecord>) => void;
    selectedRecords: Array<IDataRecord>;
}
const useEdit = ({
    originalRecords,
    setOriginalRecords,
    selectedRecords
}: IUseEditProps) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [editModalProps, setEditModalProps] = useState<IEditModalProps>({
        value: '',
        record: null,
        columnConfig: null
    });
    const onEditableClick = (record: IDataRecord, columnConfig: IColumnConfig) => {
        // set values before opening modal
        setEditModalProps({
            ...editModalProps,
            record,
            columnConfig,
            value: record[columnConfig.key]
        });
        setShowEditModal(true);
    };
    const editModalCross = () => {
        // reset all values
        setEditModalProps({
            record: null,
            columnConfig: null,
            value: ''
        });
        setShowEditModal(false);
    };
    const editModalDone = (v: any) => {
        const { record, columnConfig } = editModalProps;
        if (record) {
            setOriginalRecords(originalRecords.map(d => {
                if (d.id === record.id) {
                    return {
                        ...d,
                        [columnConfig!.key]: v
                    };
                }
                return d;
            }));
        } else if (selectedRecords.length) {
            const newData = selectedRecords.map(d => {
                return { ...d, [columnConfig!.key]: v };
            });
            setOriginalRecords(updateArrayWithAnother(newData, originalRecords));
        }
        // We can also perform validations here and if validation fails
        // we can avoid closing the dialog
        editModalCross();
    };

    return {
        showEditModal,
        setShowEditModal,
        editModalProps,
        setEditModalProps,
        onEditableClick,
        editModalCross,
        editModalDone,
    };
};

export default useEdit;