import {Module} from "@nestjs/common";
import {VendorController} from "./vendor.controller";
import {VendorService} from "./vendor.service";

@Module({
    imports: [],
    controllers: [VendorController],
    providers: [VendorService],
})
export class VendorModule {
}
