import { Observable } from "rxjs";

export interface AuthServiceInterface {
  login(handle: string, password: string): Observable<boolean>;

  logout(): void;

  isAuthenticated(): Observable<boolean>;
}
