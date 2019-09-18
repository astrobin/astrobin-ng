import { Observable } from "rxjs";
import { JwtTokenInterface } from "@shared/interfaces/auth/jwt-token.interface";

export interface AuthServiceInterface {
    login(handle: string, password: string): Observable<JwtTokenInterface>;
}
