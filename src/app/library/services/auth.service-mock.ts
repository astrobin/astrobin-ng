import { AuthServiceInterface } from "@lib/services/auth.service-interface";
import { Observable, of } from "rxjs";

export class AuthServiceMock implements AuthServiceInterface {
  login(handle: string, password: string): Observable<boolean> {
    return of(true);
  }

  logout(): void {}

  isAuthenticated(): Observable<boolean> {
    return of(true);
  }
}
