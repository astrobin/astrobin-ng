import { Module } from "@nestjs/common";
import { ConfigModule } from "./config.module";
import { CertifiedEquipmentModule } from "./certified-equipment/certified-equipment.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "./config.service";
import { AuthModule } from "./auth/auth.module";
import { CommonModule } from "./common/common.module";

@Module({
    imports: [
        TypeOrmModule.forRoot(ConfigService.getTypeOrmConfiguration()),
        ConfigModule,
        AuthModule,
        CertifiedEquipmentModule,
        CommonModule,
    ],
})
export class AppModule {
}
