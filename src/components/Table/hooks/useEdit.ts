import { useEffect, useRef, useState } from "react";
import { IColumnConfig, IDataRecord, IEditModalProps } from "../../../shared/interfaces";
import { updateArrayWithAnother } from "../../../shared/utils";

interface IUseEditProps {
    originalRecords: Array<IDataRecord>;
    setOriginalRecords: (records: Array<IDataRecord>) => void;
    selectedRecords: Array<IDataRecord>;
    onEdit?: (data: Array<IDataRecord>) => void;
}
const useEdit = ({
    originalRecords,
    setOriginalRecords,
    selectedRecords,
    onEdit
}: IUseEditProps) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const isEdited = useRef<Array<IDataRecord>>([]);
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
            isEdited.current = [{...record, [columnConfig!.key]: v}];
            setOriginalRecords(originalRecords.map(d => {
                if (d.id === record.id) {
                    return {
                        ...d,
                        [columnConfig!.key]: isEdited.current[0][columnConfig!.key]
                    };
                }
                return d;
            }));
        } else if (selectedRecords.length) {
            const newData = selectedRecords.map(d => {
                return { ...d, [columnConfig!.key]: v };
            });
            isEdited.current = newData;
            setOriginalRecords(updateArrayWithAnother(newData, originalRecords));
        }
        // We can also perform validations here and if validation fails
        // we can avoid closing the dialog
        editModalCross();
    };

    // Toggle Type handling
    const toggleSwitch = (value: boolean, key: string, record: IDataRecord) => {
        isEdited.current = [{...record, [key]: value}];
        setOriginalRecords(originalRecords.map(d => {
            if (d.id === record.id) {
                return {...record, [key]: isEdited.current[0][key]};
            }
            return d
        }));
    };

    useEffect(() => {
        if (isEdited.current.length)
            onEdit && onEdit(isEdited.current);
        isEdited.current = [];
    }, [isEdited.current]);

    return {
        showEditModal,
        setShowEditModal,
        editModalProps,
        setEditModalProps,
        onEditableClick,
        editModalCross,
        editModalDone,
        toggleSwitch
    };
};

export default useEdit;