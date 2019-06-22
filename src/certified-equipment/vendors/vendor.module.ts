import {Module} from "@nestjs/common";
import {VendorController} from "./vendor.controller";
import {VendorService} from "./vendor.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Vendor} from "./vendor.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Vendor])],
    controllers: [VendorController],
    providers: [VendorService],
})
export class VendorModule {
}
