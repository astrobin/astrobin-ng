import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs";
import { JwtTokenInterface } from "@shared/interfaces/auth/jwt-token.interface";

export interface LoginDto {
    handle: string;
    password: string;
}

@Controller("auth")
export class AuthController {
    public constructor(public readonly authService: AuthService) {
    }

    @Post("login")
    public login(@Body() loginDto: LoginDto): Observable<JwtTokenInterface> {
        return this.authService.login(loginDto.handle, loginDto.password);
    }
}
