import {Controller, Get, Param} from "@nestjs/common";
import {VendorService} from "./vendor.service";
import {Vendor} from "./vendor.entity";

@Controller()
export class VendorController {
    constructor(private readonly vendorService: VendorService) {
    }

    @Get()
    getVendors(): Promise<Vendor[]> {
        return this.vendorService.search();
    }

    @Get(":id")
    getVendor(@Param() params: any): Promise<Vendor> {
        return this.vendorService.get(params.id);
    }
}
