import { AuthServiceInterface } from "@shared/services/auth.service-interface";
import { BaseService } from "@shared/services/base.service";
import { Observable, of } from "rxjs";

export class AuthServiceMock extends BaseService implements AuthServiceInterface {
  login(handle: string, password: string, redirectUrl?: string): Observable<boolean> {
    return of(true);
  }

  logout(): void {}

  isAuthenticated(): Observable<boolean> {
    return of(true);
  }
}
