import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../contexts";
import { ProductCell, Table } from "../components";
import { TableSkeleton } from "../components/Skeletons";
import { IAction, IColumnConfig, IDataRecord, IOption, IProduct } from "../shared/interfaces";
import { ActionType, ControlType, HeaderType } from "../shared/enums";

const Owner = () => {
    const { products, isPending, owner } = useContext(StoreContext);
    const columns: Array<IColumnConfig> = [
        {
            key: 'product_name',
            title: 'Product',
            type: HeaderType.String,
            component: (record: IDataRecord, label: string, index: number) => <ProductCell label={label} product={record as IProduct} index={index} />
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
            type: HeaderType.StringArray,
            filter: true
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
    const [ownerProducts, setOwnerProducts] = useState<Array<IProduct>>([]);
    useEffect(() => {
        if (owner) {
            setOwnerProducts(products.filter(product => product.merchant_id === owner));
        } else {
            setOwnerProducts([]);
        }
    }, [owner]);


    return (
        <>
            { ownerProducts.length ? <Table key={owner} data={ownerProducts} columns={columns} groupActions={groupActions} /> : isPending ? <TableSkeleton /> : null }
        </>
    );
}

export default Owner