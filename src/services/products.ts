import { IProduct } from "../shared/interfaces";

export const getProducts = (): Promise<IProduct[]> => {
    return fetch('/data.json').then(response => response.json());
};