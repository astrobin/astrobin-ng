import {Vendor} from "./vendor.entity";

export interface VendorServiceInterface {
    search(): Promise<Vendor[]>;
    get(id: string): Promise<Vendor>;
}
