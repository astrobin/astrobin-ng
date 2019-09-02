import {Module} from "@nestjs/common";
import {VendorModule} from "./vendor/vendor.module";

@Module({
    imports: [
        VendorModule,
    ],
    exports: [
        VendorModule,
    ],
})
export class CertifiedEquipmentModule {
}
