import {Module} from "@nestjs/common";
import {VendorModule} from "./vendors/vendor.module";

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
