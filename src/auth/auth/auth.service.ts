import {JwtService} from "@nestjs/jwt";
import {UserService} from "../user/user.service";
import {HttpStatus, Injectable} from "@nestjs/common";
import {AuthServiceInterface} from "./auth.service.interface";
import {User} from "../user/user.entity";
import {AuthUtils} from "./auth-utils";

interface JwtTokenInterface {
    expires_in: number;
    access_token: string;
    user_id: string;
    status: number;
}

@Injectable()
export class AuthService implements AuthServiceInterface {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {
    }

    public async login(userData: User): Promise<JwtTokenInterface | { status: number }> {
        const user = await this.userService.findByEmail(userData.email);

        if (!user) {
            return {status: HttpStatus.NOT_FOUND};
        }

        if (AuthUtils.hashPassword(userData.password) !== user.password) {
            return {status: HttpStatus.FORBIDDEN};
        }

        const payload = `${user.id}`;
        const accessToken = this.jwtService.sign(payload);

        return {
            expires_in: 3600,
            access_token: accessToken,
            user_id: payload,
            status: HttpStatus.OK,
        };
    }

    public async register(userData: User): Promise<User | {status: number}> {
        const user = await this.userService.findByEmail(userData.email);

        if (user) {
            return {status: HttpStatus.FORBIDDEN};
        }

        return this.userService.create(userData);
    }
}
