import { AuthServiceInterface } from "@shared/services/auth.service-interface";
import { Observable, of } from "rxjs";

export class AuthServiceMock implements AuthServiceInterface {
  login(handle: string, password: string, redirectUrl?: string): Observable<boolean> {
    return of(true);
  }

  logout(): void {}

  isAuthenticated(): Observable<boolean> {
    return of(true);
  }
}
