import { Injectable } from "@angular/core";
import { AuthServiceInterface } from "@shared/services/auth.service-interface";
import { BaseService } from "@shared/services/base.service";
import { Observable, of } from "rxjs";

@Injectable()
export class AuthServiceMock extends BaseService implements AuthServiceInterface {
  login(handle: string, password: string, redirectUrl?: string): Observable<string> {
    return of("token-1234567890");
  }

  logout(): void {}

  isAuthenticated(): Observable<boolean> {
    return of(true);
  }
}
