import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthApiService } from "../../interfaces/auth-api.service.interface";
import { BaseClassicApiService } from "../base-classic-api.service";

@Injectable({
  providedIn: "root"
})
export class AuthClassicApiService extends BaseClassicApiService implements AuthApiService {
  public configUrl = this.baseUrl;

  public constructor(public http: HttpClient) {
    super();
  }

  public login(handle: string, password: string): Observable<string> {
    return this.http
      .post<{ token: string }>(this.configUrl + "/api-auth-token/", {
        username: handle,
        password
      })
      .pipe(map(response => (response ? response.token : null)));
  }
}
