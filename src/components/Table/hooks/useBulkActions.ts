import { ActionType } from "../../../shared/enums";
import { GroupAction, IColumnConfig, IDataRecord, IEditModalProps, IOption } from "../../../shared/interfaces";
import { updateArrayWithAnother } from "../../../shared/utils";

interface IUseBulkActionsProps {
    originalRecords: Array<IDataRecord>;
    setOriginalRecords: (records: Array<IDataRecord>) => void;
    selectedRecords: Array<IDataRecord>;
    columnConfigs: Array<IColumnConfig>;
    editModalProps: IEditModalProps;
    setEditModalProps: (props: IEditModalProps) => void;
    showEditModal: (show: boolean) => void;
    onEdit?: (data: Array<IDataRecord>) => void;
}
const useBulkActions = ({
    selectedRecords,
    originalRecords,
    setOriginalRecords,
    columnConfigs,
    editModalProps,
    setEditModalProps,
    showEditModal,
    onEdit
}: IUseBulkActionsProps) => {
    const onGroupAction = (option: IOption<GroupAction> | null) => {
        if (!option) {
            return;
        }

        if (option.value.type === ActionType.HandleData) {
            // If function is provided it will return records with new value
            const newRecords = option.value.fn(selectedRecords);
            setOriginalRecords(updateArrayWithAnother(newRecords, originalRecords));
            onEdit && onEdit(newRecords);
        } else if (option.value.type === ActionType.RequestNewValue) {
            // else show edit modal for new value
            const config = columnConfigs.find(c => c.key === (option.value as {type: ActionType.RequestNewValue; columnKey: string}).columnKey);
            if (!config) {
                return;
            }

            setEditModalProps({
                ...editModalProps,
                record: null,
                columnConfig: config,
                value: ''
            });
            showEditModal(true);
        } else if (option.value.type === ActionType.SimpleFunction) {
            option.value.fn(selectedRecords);
        }
    };

    return {
        onGroupAction
    };
};
export default useBulkActions;