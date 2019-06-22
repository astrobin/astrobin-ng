import {Module} from "@nestjs/common";
import {VendorModule} from "./certified-equipment/vendors/vendor.module";

@Module({
    imports: [
        VendorModule,
    ],
})
export class AppModule {
}
