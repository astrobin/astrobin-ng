import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { LoadingService } from "@core/services/loading.service";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

import type { AuthApiService } from "../../interfaces/auth-api.service-interface";
import { BaseClassicApiService } from "../base-classic-api.service";

@Injectable({
  providedIn: "root"
})
export class AuthClassicApiService extends BaseClassicApiService implements AuthApiService {
  public configUrl = this.baseUrl;

  public constructor(public loadingService: LoadingService, public http: HttpClient) {
    super(loadingService);
  }

  public login(handle: string, password: string): Observable<string> {
    return this.http
      .post<{ token: string }>(this.configUrl + "/api-auth-token/", {
        username: handle,
        password
      })
      .pipe(map((response: { token: string }) => (response ? response.token : null)));
  }
}
