import { JwtService } from "@nestjs/jwt";
import { HttpService, Injectable } from "@nestjs/common";
import { AuthServiceInterface} from "./auth.service.interface";
import { Observable, of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { JwtTokenInterface } from "../../../shared/interfaces/auth/jwt-token.interface";

@Injectable()
export class AuthService implements AuthServiceInterface {
    public readonly LEGACY_API_URL = process.env.LEGACY_API_URL || "http://localhost:8084";

    constructor(
        public readonly http: HttpService,
        public readonly jwtService: JwtService,
    ) {
    }

    public login(handle: string, password: string): Observable<JwtTokenInterface> {
        const tokenUrl = this.LEGACY_API_URL + "/api/v2/api-auth-token/";
        const userProfileUrl = this.LEGACY_API_URL + "/api/v2/common/userprofiles/current/";
        const data = { username: handle, password };

        return this.http.post<{ token: string }>(tokenUrl, data).pipe(
            mergeMap(response => {
                    const headers = {
                        Authorization: "Token " + response.data.token,
                    };
                    return this.http.get<any>(userProfileUrl, { headers });
                },
            ),
            map(response => ({
                token: this.jwtService.sign(response.data[0].id),
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
