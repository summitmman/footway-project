import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { IProduct, IStoreContext } from "../shared/interfaces";
import { UserType } from "../shared/enums";
import { DEFAULT_OWNER } from "../shared/constants";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../services/products";

export const StoreContext = createContext<IStoreContext>({
    isPending: false,
    owner: '',
    owners: [],
    products: [],
    userType: UserType.OWNER,
    setOwner: () => {},
    setUserType: () => {}
});

const StoreProvider = ({ children }: PropsWithChildren) => {
    const [userType, setUserType] = useState(UserType.OWNER);
    const [owner, setOwner] = useState(DEFAULT_OWNER);
    
    const { isPending, data: products } = useQuery({
        initialData: [],
        queryKey: ['products'],
        queryFn: getProducts
    });

    const owners = Array.from(products.reduce<Set<string>>(
        (acc: Set<string>, product: IProduct) => {
            return acc.add(product.merchant_id);
        },
        new Set()
    ));

    useEffect(() => {
        setOwner(owners[0] ?? '');
    }, [products.length]);
    
    return (
        <StoreContext.Provider
            value={{
                products,
                isPending,
                owners,
                userType,
                setUserType,
                owner,
                setOwner
            }}
        >
            {children}
        </StoreContext.Provider>
    );
};
export default StoreProvider;