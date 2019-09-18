import { Controller, Get, Post, Query } from "@nestjs/common";
import { Observable } from "rxjs";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";
import { VendorService } from "../vendor.service";

@Controller("vendor-utils")
export class VendorUtilsController {
    constructor(private readonly service: VendorService) {
    }

    @Get("/similar/")
    public findSimilar(@Query() query): Observable<VendorInterface[]> {
        return this.service.findSimilar(query.q);
    }
}
