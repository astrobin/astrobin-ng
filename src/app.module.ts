import {Module} from "@nestjs/common";
import {ConfigModule} from "./config.module";
import {CertifiedEquipmentModule} from "./certified-equipment/certified-equipment.module";
import {CertifiedEquipmentService} from "./certified-equipment/certified-equipment.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {ConfigService} from "./config.service";

@Module({
    imports: [
        TypeOrmModule.forRoot(ConfigService.getTypeOrmConfiguration()),
        ConfigModule,
        CertifiedEquipmentModule,
    ],
    providers: [
        Repository,
        CertifiedEquipmentService,
    ],
})
export class AppModule {
}
