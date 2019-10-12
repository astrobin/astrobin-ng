import { HttpService, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { JwtTokenInterface } from "../../../shared/interfaces/auth/jwt-token.interface";

@Injectable()
export class AuthApiService {
    public readonly LEGACY_API_URL = process.env.LEGACY_API_URL || "http://localhost:8084";

    constructor(public readonly http: HttpService) {
    }

    public login(handle: string, password: string): Observable<any> {
        const tokenUrl = this.LEGACY_API_URL + "/api/v2/api-auth-token/";
        const credentials = { username: handle, password };

        return this.http.post<{ token: string }>(tokenUrl, credentials).pipe(
            mergeMap(response => {
                const headers = {
                    Authorization: "Token " + response.data.token,
                };
                return this.getUserProfile(headers);
            }),
        );
    }

    public getUserProfile(headers: { Authorization: string }): Observable<any> {
        const userProfileUrl = this.LEGACY_API_URL + "/api/v2/common/userprofiles/current/";
        return this.http.get<any>(userProfileUrl, { headers });
    }
}
