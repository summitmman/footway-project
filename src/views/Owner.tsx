import { useContext } from "react";
import { StoreContext } from "../contexts";
import { Table } from "../components";
import { TableSkeleton } from "../components/Skeletons";
import { IAction, IColumnConfig, IOption, IProduct } from "../shared/interfaces";
import { ActionType, ControlType, HeaderType } from "../shared/enums";

const Owner = () => {
    const { products, isPending } = useContext(StoreContext);
    const columns: Array<IColumnConfig> = [
        {
            key: 'product_name',
            title: 'Product',
            type: HeaderType.String
        },
        {
            key: 'price',
            title: 'Price',
            type: HeaderType.Number,
            editable: true
        },
        {
            key: 'quantity',
            title: 'Stock',
            type: HeaderType.Number,
            filter: [3, 8, 1]
        },
        {
            key: 'vendor',
            title: 'Vendor',
            type: HeaderType.String,
            filter: true
        },
        {
            key: 'product_type',
            title: 'Type',
            type: HeaderType.StringArray
        },
        {
            key: 'department',
            title: 'Department',
            type: HeaderType.StringArray
        },
        {
            key: '_enable',
            title: 'Enable',
            type: HeaderType.Boolean,
            editable: true,
            control: ControlType.Switch
        }
    ];
    const groupActions: Array<IOption<Function | IAction>> = [
        {
            label: 'Enable Products',
            value: (selectedDataSet: Array<IProduct>) => {
                return selectedDataSet.map(d => {
                    return { ...d, _enable: true };
                });
            }
        },
        {
            label: 'Disable Products',
            value: (selectedDataSet: Array<IProduct>) => {
                return selectedDataSet.map(d => {
                    return { ...d, _enable: false };
                });
            }
        },
        {
            label: 'Set Price',
            value: {
                type: ActionType.RequestNewValue,
                columnKey: 'price'
            }
        }
    ];

    return (
        <>
            { products.length ? <Table data={products} columns={columns} groupActions={groupActions} /> : isPending ? <TableSkeleton /> : null }
        </>
    );
}

export default Owner