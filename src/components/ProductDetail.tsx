import { IProduct } from "../shared/interfaces";

const ProductDetail = ({ product }: {product: IProduct}) => {
    const {
        image_url,
        product_name,
        product_description,
        price,
        ...details
    }: {
        image_url: string;
        product_name: string;
        product_description: string;
        price: string;
        [key: string]: any;
    } = product;

    return (
        <div className="p-8">
            <div className="max-h-[50vh] text-center">
                <img src={image_url} alt={product_name} className="max-h-[50vh] inline-block" />
            </div>
            <h2 className="font-bold text-xl mt-4 text-primary">{product_name}</h2>
            <p dangerouslySetInnerHTML={{ __html: product_description}}></p>
            <p className="mt-4 font-bold">
                <span className="text-primary">Price:</span> {price}
            </p>
            <h3 className="mt-4 font-bold text-lg text-primary">More details</h3>
            <table className="table">
                <tbody>
                    {
                        Object.keys(details).map(key => {
                            if (key.startsWith('_')) {
                                return null;
                            }
                            return (
                                <tr key={key}>
                                    <td className="font-bold">{key}</td>
                                    <td>{details[key]}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    );
}

export default ProductDetail