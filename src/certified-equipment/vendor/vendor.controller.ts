import { Controller } from "@nestjs/common";
import { VendorService } from "./vendor.service";
import { Vendor } from "./vendor.entity";
import { Crud } from "@nestjsx/crud";

@Crud({
    model: {
        type: Vendor,
    },
    params: {
        id: {
            field: "id",
            type: "uuid",
            primary: true,
        },
    },
})
@Controller("vendors")
export class VendorController {
    constructor(private readonly service: VendorService) {
    }
}
