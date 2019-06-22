import {Module} from "@nestjs/common";
import {ConfigModule} from "./config.module";
import {CertifiedEquipmentModule} from "./certified-equipment/certified-equipment.module";
import {CertifiedEquipmentService} from "./certified-equipment/certified-equipment.service";

@Module({
    imports: [
        ConfigModule,
        CertifiedEquipmentModule,
    ],
    providers: [
        CertifiedEquipmentService,
    ],
})
export class AppModule {
}
