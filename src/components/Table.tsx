import { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts";

const Table = () => {
    const { products } = useContext(UserContext);
    const [headers, setHeaders] = useState(Object.keys(products[0] ?? {}))
    useEffect(() => {
        setHeaders(Object.keys(products[0] ?? {}));
    }, [products.length]);
    
    if (!products.length) {
        return null;
    }

    return (
        <table className="table">
            <thead>
                <tr>
                    {
                        headers.map(header => <th key={header}>{ header }</th>)
                    }
                </tr>
            </thead>
            <tbody>
                {
                    products.slice(0, 20).map(product => (
                        <tr key={product.id} className="hover">
                            {
                                headers.map(header => <td key={header + product.id}>{(product as any)[header]}</td>)
                            }
                        </tr>
                    ))
                }
            </tbody>
        </table>
    );
}

export default Table