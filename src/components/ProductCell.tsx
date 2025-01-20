import { useRef } from "react";
import ProductDetail from "./ProductDetail";
import { IProduct } from "../shared/interfaces";

interface IProductCellProps {
    product: IProduct;
    label: string;
    index: number;
}
const ProductCell = ({ product, label, index }: IProductCellProps) => {
    const modalRef = useRef<HTMLDialogElement | null>(null);
    const onClick = () => {
        modalRef.current!.showModal();
    };
    return (
        <>
            <a className="group relative inline-block cursor-pointer" onClick={onClick}>
                <img
                    src={product.image_url}
                    alt={label}
                    className={
                        `absolute hidden group-hover:block h-[100px] z-10 p-[5px] bg-white rounded-md ${index ? '-top-[110px]' : '-bottom-[110px]'}`
                    } />
                <span dangerouslySetInnerHTML={{__html: label}}></span>
            </a>
            <dialog ref={modalRef} id="my_modal_3" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <ProductDetail product={product} />
                </div>
            </dialog>
        </>
    );
}

export default ProductCell