import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";
import { AuthServiceInterface } from "./auth.service.interface";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { JwtTokenInterface } from "../../../shared/interfaces/auth/jwt-token.interface";
import { AuthApiService } from "./auth-api.servicee";

@Injectable()
export class AuthService implements AuthServiceInterface {
    constructor(
        public readonly authApi: AuthApiService,
        public readonly jwtService: JwtService,
    ) {
    }

    public login(handle: string, password: string): Observable<JwtTokenInterface> {
        return this.authApi.login(handle, password).pipe(
            map(response => ({
                token: this.jwtService.sign("" + response.data[0].id),
                user_profile_id: response.data[0].id,
            })),
            catchError((error) => of({
                token: null,
                user_profile_id: null,
                error,
            })),
        );
    }
}
