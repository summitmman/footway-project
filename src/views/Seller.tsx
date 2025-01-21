import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../contexts";
import { ProductCell, Table } from "../components";
import { TableSkeleton } from "../components/Skeletons";
import { GroupAction, IColumnConfig, IDataRecord, IOption, IProduct } from "../shared/interfaces";
import { ActionType, ControlType, HeaderType } from "../shared/enums";

const Seller = () => {
    const { products, isPending } = useContext(StoreContext);
    const [enabledProducts, setEnabledProducts] = useState<Array<IProduct>>([]);
    useEffect(() => {
        // add MSC enabled filter logic here
        setEnabledProducts(products);
    }, [products]);
    const columns: Array<IColumnConfig> = [
        {
            key: 'product_name',
            title: 'Product',
            type: HeaderType.String,
            component: (record: IDataRecord, label: string, index: number) => <ProductCell label={label} product={record as IProduct} index={index} />
        },
        {
            key: 'price',
            title: 'Wholesale Price',
            type: HeaderType.Number,
        },
        {
            key: 'retailPrice',
            title: 'Retail Price',
            type: HeaderType.Number,
            editable: true
        },
        {
            key: '',
            title: 'Margin',
            type: HeaderType.Number,
            // implemented later, currently only used in table display and csv download
            value: (record: IDataRecord) => {
                const r = record as IProduct;
                if (r.retailPrice == null) {
                    return null;
                }
                const p = Number(!r.price ? '0' : r.price);
                const margin = (((r.retailPrice - p) / r.retailPrice) * 100).toFixed(2);
                return margin;
            },
            component: (record: IDataRecord, label: string) => {
                if (label == null) {
                    return <div className="badge badge-neutral">na</div>
                }
                return <div dangerouslySetInnerHTML={{__html: `${label}%`}}></div>;
            }
        },
        {
            key: 'enableToSell',
            title: 'Sell',
            type: HeaderType.Boolean,
            editable: true,
            control: ControlType.Switch
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
        }
    ];
    const groupActions: Array<IOption<GroupAction>> = [
        {
            label: 'Enable Sell',
            value: {
                type: ActionType.HandleData,
                fn: (selectedDataSet: Array<IProduct>) => {
                    return selectedDataSet.map(d => {
                        return { ...d, enableToSell: true };
                    });
                }
            }
        },
        {
            label: 'Disable Sell',
            value: {
                type: ActionType.HandleData,
                fn: (selectedDataSet: Array<IProduct>) => {
                    return selectedDataSet.map(d => {
                        return { ...d, enableToSell: false };
                    });
                }
            }
        },
        {
            label: 'Set Retail Price',
            value: {
                type: ActionType.RequestNewValue,
                columnKey: 'retailPrice'
            }
        },
        {
            label: 'Download CSV',
            value: {
                type: ActionType.SimpleFunction,
                fn: (selectedDataSet: Array<IProduct>) => {
                    // ideally we should have a separate column config for CSV
                    const headers = columns.map(column => column.title);
                    const values = selectedDataSet.map((record, index) => {
                        return columns.map(column => {
                            if (column.value) {
                                return column.value(record, index);
                            }
                            return (record as any)[column.key]
                        });
                    });
                    const csvContent = [headers, ...values].map(e => e.join(',')).join('\n');
                
                    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "Products.csv");
                    link.click();
                }
            }
        }
    ];
    const onEdit = (data: Array<IDataRecord>) => {
        console.log('update server with', data);
    };


    return (
        <>
            { enabledProducts.length ? <Table data={enabledProducts} columns={columns} groupActions={groupActions} onEdit={onEdit} /> : isPending ? <TableSkeleton /> : null }
        </>
    );
}

export default Seller