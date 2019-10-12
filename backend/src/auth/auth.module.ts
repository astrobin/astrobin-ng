import { HttpModule, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "../config.service";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { PassportModule } from "@nestjs/passport";
import { AuthApiService } from "./auth-api.servicee";

@Module({
    imports: [
        HttpModule,
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.register({
            secretOrPrivateKey: ConfigService.getSecretJwtKey(),
        }),
    ],
    providers: [AuthService, AuthApiService, JwtStrategy],
    controllers: [AuthController],
})
export class AuthModule {
}
