import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { VendorService } from "./vendor.service";
import { Vendor } from "./vendor.entity";
import { Crud } from "@nestjsx/crud";
import { AuthGuard } from "@nestjs/passport";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

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

    @Get("rebuild-search-index")
    public rebuildSearchIndex(): Observable<number> {
        return this.service.rebuildSearchIndex().pipe(map(vendors => vendors.length));
    }
}
