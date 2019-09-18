import { Module } from "@nestjs/common";
import { VendorController } from "./vendor.controller";
import { VendorService } from "./vendor.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vendor } from "./vendor.entity";
import { SearchModule } from "../../search/search.module";
import { VendorEntitySubscriber } from "./vendor.entity-subscriber";
import { VendorUtilsController } from "./vendor-utils/vendor-utils.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Vendor]),
        SearchModule,
    ],
    controllers: [
        VendorController,
        VendorUtilsController,
    ],
    providers: [
        VendorEntitySubscriber,
        VendorService,
    ],
})
export class VendorModule {
}
