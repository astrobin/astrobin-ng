import { Controller, UseGuards } from "@nestjs/common";
import { VendorService } from "./vendor.service";
import { Vendor } from "./vendor.entity";
import { Crud } from "@nestjsx/crud";
import { AuthGuard } from "@nestjs/passport";

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
@UseGuards(AuthGuard("jwt"))
export class VendorController {
    constructor(private readonly service: VendorService) {
    }
}
