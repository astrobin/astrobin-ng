import {JwtService} from "@nestjs/jwt";
import {UserService} from "../user/user.service";
import {Injectable} from "@nestjs/common";
import {AuthServiceInterface} from "./auth.service.interface";
import {User} from "../user/user.entity";

@Injectable()
export class AuthService implements AuthServiceInterface {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {
    }

    public async login(user: User): Promise<User | { status: number }> {
        return this.validate(user).then((userData) => {
            if (!userData) {
                return {status: 404};
            }

            const payload = `${userData.id}`;
            const accessToken = this.jwtService.sign(payload);

            return {
                expires_in: 3600,
                access_token: accessToken,
                user_id: payload,
                status: 200,
            };
        });
    }

    public async register(user: User): Promise<User> {
        return this.userService.create(user);
    }

    private async validate(userData: User): Promise<User> {
        return await this.userService.findByEmail(userData.email);
        // TODO: check for password.
    }
}
