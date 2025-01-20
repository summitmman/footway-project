import { CheckStatus } from "../../../shared/enums";
import { IDataRecord } from "../../../shared/interfaces";

interface IUseSelectProps {
    originalRecords: Array<IDataRecord>;
    setOriginalRecords: (records: Array<IDataRecord>) => void;
    filteredRecords: Array<IDataRecord>;
}
const useSelect = ({
    originalRecords,
    setOriginalRecords,
    filteredRecords
}: IUseSelectProps) => {
    
    // Toggle Record Select handling
    const toggleRowSelect = (value: boolean, id: string | number, record: IDataRecord) => {
        setOriginalRecords(originalRecords.map(d => {
            if (d.id === id) {
                return {...record, __selected: value};
            }
            return d
        }));
    };

    // Toggle All Records Select Handling
    const toggleAllSelect = () => {
        if (checkStatus === CheckStatus.None) {
            // if none selected, select all
            setOriginalRecords(originalRecords.map(d => {
                return {...d, __selected: true};
            }));
        } else if (checkStatus === CheckStatus.All || checkStatus === CheckStatus.Some) {
            setOriginalRecords(originalRecords.map(d => {
                return {...d, __selected: false};
            }));
        }
    }
    const selectedRecords = originalRecords.filter(d => d.__selected);
    const checkStatus =
        selectedRecords.length
            ? (selectedRecords.length === filteredRecords.length ? CheckStatus.All : CheckStatus.Some)
            : CheckStatus.None;
    const ariaCheckedStatus: true | false | 'mixed' = checkStatus === CheckStatus.All ? true : (checkStatus === CheckStatus.None ? false : 'mixed');

    return {
        toggleRowSelect,
        toggleAllSelect,
        selectedRecords,
        checkStatus,
        ariaCheckedStatus
    };
};

export default useSelect;