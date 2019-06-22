import {Module} from "@nestjs/common";
import {ConfigModule} from "./config.module";
import {CertifiedEquipmentModule} from "./certified-equipment/certified-equipment.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigService} from "./config.service";

@Module({
    imports: [
        TypeOrmModule.forRoot(ConfigService.getTypeOrmConfiguration()),
        ConfigModule,
        CertifiedEquipmentModule,
    ],
})
export class AppModule {
}
