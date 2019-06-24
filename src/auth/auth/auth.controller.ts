import {Body, Controller, Post} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {User} from "../user/user.entity";

@Controller("auth")
export class AuthController {
    constructor(private readonly  authService: AuthService) {
    }

    @Post("login")
    async login(@Body() user: User): Promise<User | { status: number }> {
        return this.authService.login(user);
    }

    @Post("register")
    async register(@Body() user: User): Promise<User | {status: number}> {
        return this.authService.register(user);
    }
}
