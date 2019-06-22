import {Controller, Get} from "@nestjs/common";
import {VendorService} from "./vendor.service";

@Controller()
export class VendorController {
    constructor(private readonly vendorService: VendorService) {
    }

    @Get()
    getHello(): string {
        return this.vendorService.getHello();
    }
}
