import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { BackendConfigInterface } from "@core/interfaces/backend-config.interface";
import type { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import type { JsonApiServiceInterface } from "@core/services/api/classic/json/json-api.service-interface";
import type { LoadingService } from "@core/services/loading.service";
import { environment } from "@env/environment";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { BaseClassicApiService } from "../base-classic-api.service";

@Injectable({
  providedIn: "root"
})
export class JsonApiService extends BaseClassicApiService implements JsonApiServiceInterface {
  configUrl = environment.classicApiUrl + "/json-api";

  constructor(public loadingService: LoadingService, private http: HttpClient) {
    super(loadingService);
  }

  getBackendConfig(): Observable<BackendConfigInterface> {
    return this.http.get<BackendConfigInterface>(`${this.configUrl}/common/app-config/`);
  }

  toggleUseHighContrastThemeCookie(): Observable<void> {
    return this.http.post<void>(
      `${this.configUrl}/user/toggle-use-high-contrast-theme-cookie/`,
      {},
      { withCredentials: true }
    );
  }

  urlIsAvailable(url: string): Observable<boolean> {
    return this.http
      .get<{ available: boolean }>(`${this.configUrl}/common/url-is-available/?url=${url}`)
      .pipe(map(response => response.available));
  }

  hasLegacyGear(userId: UserInterface["id"]): Observable<boolean> {
    return this.http
      .get<{ result: boolean }>(`${this.configUrl}/user/has-legacy-gear/?userId=${userId}`)
      .pipe(map(response => response.result));
  }

  requestCountry(): Observable<string> {
    return this.http
      .get<{ country: string }>(`${this.configUrl}/common/request-country/`)
      .pipe(map(response => response.country));
  }

  recordHit(contentTypeId: ContentTypeInterface["id"], objectId: number): Observable<void> {
    return this.http.post<void>(`${this.configUrl}/common/record-hit/`, {
      content_type_id: contentTypeId,
      object_id: objectId
    });
  }

  serviceWorkerEnabled(): Observable<boolean> {
    return this.http
      .get<{ swEnabled: boolean }>(`${this.configUrl}/common/service-worker-control/`)
      .pipe(map(response => response.swEnabled));
  }

  translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    options: {
      format?: "bbcode" | "html";
    } = {}
  ): Observable<{
    translation: string;
    remaining_requests: number;
  }> {
    return this.http.post<{
      translation: string;
      remaining_requests: number;
    }>(`${this.configUrl}/common/translate/`, {
      text,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      format: options.format
    });
  }
}
