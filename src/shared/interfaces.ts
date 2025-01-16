import { UserType } from "./enums";

export type User =
    { type: UserType.SELLER }
    | { type: UserType.OWNER; name: string; };

export interface IProduct {
    id: number;
    merchant_id: string;
    variant_id: string;
    product_name: string;
    supplier_model_number: string;
    ean: string[];
    size: string;
    vendor: string;
    quantity: number;
    product_type: string[];
    product_group: string[];
    department: string[];
    variant_created: Date;
    variant_updated: Date;
    inventory_level_created: Date;
    inventory_level_updated: Date;
    image_url: string;
    price: string;
    product_description: string;
}

export interface IUserContext {
    products: IProduct[];
    isPending: boolean;
    owners: string[];
    userType: UserType;
    setUserType: React.Dispatch<React.SetStateAction<UserType>>;
    owner: string;
    setOwner: React.Dispatch<React.SetStateAction<string>>;
}