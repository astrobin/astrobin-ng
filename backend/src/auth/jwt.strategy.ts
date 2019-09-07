import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "../config.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
            ignoreExpiration: false,
            secretOrKey: ConfigService.getSecretJwtKey(),
        });
    }

    async validate(payload: any) {
        return true; // trust the signature to avoid another API round trip to the legacy API server.
    }
}
