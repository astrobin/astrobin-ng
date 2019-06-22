import {Injectable} from "@nestjs/common";
import {Vendor} from "./vendor.entity";
import {VendorServiceInterface} from "./vendor.service.interface";

@Injectable()
export class VendorServiceMock implements VendorServiceInterface {
    private readonly mockVendors: Vendor[] = [
        {
            id: "1",
            name: "Test Vendor 1",
            description: "Test Vendor Description 1",
        },
        {
            id: "2",
            name: "Test Vendor 2",
            description: "Test Vendor Description 2",
        },
    ];

    search(): Promise<Vendor[]> {
        return new Promise<Vendor[]>((resolve) => resolve(this.mockVendors));
    }

    async get(id: string): Promise<Vendor> {
        return new Promise<Vendor>((resolve) => {
            let ret: Vendor = null;
            this.mockVendors.forEach(vendor => {
                if (vendor.id === id) {
                    ret = vendor;
                }
            });

            resolve(ret);
        });
    }
}
