import { useContext } from "react";
import { UserContext } from "../contexts";
import { Table } from "../components";
import { TableSkeleton } from "../components/Skeletons";
import { IColumnConfig } from "../shared/interfaces";
import { HeaderType } from "../shared/enums";

const Owner = () => {
    const { products, isPending } = useContext(UserContext);
    const columns: Array<IColumnConfig> = [
        {
            key: 'product_name',
            title: 'Product',
            type: HeaderType.String
        },
        {
            key: 'price',
            title: 'Price',
            type: HeaderType.Number
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
        }
    ];
    return (
        <>
            { products.length ? <Table data={products} columns={columns} /> : isPending ? <TableSkeleton /> : null }
        </>
    );
}

export default Owner