import { Injectable } from "@angular/core";
import { AuthApiService } from "../interfacees/auth-api.service.interface";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BaseNgApiService } from "./base-ng-api.service";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthNgApiService extends BaseNgApiService implements AuthApiService {
  public configUrl = this.baseUrl;

  public constructor(public http: HttpClient) {
    super();
  }

  public login(handle: string, password: string): Observable<string> {
    return this.http.post<{token: string}>(
      this.baseUrl + "/api-auth-token/", {username: handle, password}).pipe(
      map(response => response.token)
    );
  }
}
