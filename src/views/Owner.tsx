import { useContext } from "react";
import { UserContext } from "../contexts";
import { Table } from "../components";
import { TableSkeleton } from "../components/Skeletons";

const Owner = () => {
    const { products, isPending } = useContext(UserContext);
    return (
        <>
            { products.length ? <Table /> : isPending ? <TableSkeleton /> : null }
        </>
    );
}

export default Owner