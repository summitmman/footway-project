import { ActionType, ControlType, HeaderType, UserType } from "./enums";

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
    retailPrice?: number;
}

export interface IStoreContext {
    products: IProduct[];
    isPending: boolean;
    owners: string[];
    userType: UserType;
    setUserType: React.Dispatch<React.SetStateAction<UserType>>;
    owner: string;
    setOwner: React.Dispatch<React.SetStateAction<string>>;
}

export interface IColumnConfig {
    key: string;
    title: string;
    type: HeaderType;
    value?: (record: IDataRecord, index: number) => any;
    filter?: boolean | Array<string|number|boolean>;
    editable?: boolean;
    control?: ControlType;
    component?: (record: IDataRecord, label: string, index: number) => JSX.Element;
    cellClassName?: string;
}
export interface IOption<V=any, D=any> {
    label: string;
    value: V;
    data?: D;
}

export interface IDataRecord {
    id: string | number;
    __selected?: boolean;
    [key: string]: any;
};

export type GroupAction = (
    { type: ActionType.RequestNewValue; columnKey: string; }
    | { type: ActionType.SimpleFunction; fn: Function }
    | { type: ActionType.HandleData; fn: Function }
);

export interface IEditModalProps {
    value: any;
    columnConfig: IColumnConfig | null;
    record?: IDataRecord | null;
}