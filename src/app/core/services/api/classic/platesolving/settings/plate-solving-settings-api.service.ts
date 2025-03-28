import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SolutionInterface } from "@core/interfaces/solution.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { LoadingService } from "@core/services/loading.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { UtilsService } from "@core/services/utils/utils.service";
import { PlateSolvingSettingsInterface } from "@core/interfaces/plate-solving-settings.interface";
import { PlateSolvingAdvancedSettingsInterface } from "@core/interfaces/plate-solving-advanced-settings.interface";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";

@Injectable({
  providedIn: "root"
})
export class PlateSolvingSettingsApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/platesolving";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  getSettings(solutionId: SolutionInterface["id"]): Observable<PlateSolvingSettingsInterface> {
    let url = this.configUrl + "/settings/";

    url = UtilsService.addOrUpdateUrlParam(url, "solution", solutionId.toString());

    return this.http
      .get<PaginatedApiResultInterface<PlateSolvingSettingsInterface>>(url)
      .pipe(
        map(response => {
          if (response.count === 0) {
            return null;
          }
          return response.results[0];
        })
      );
  }

  updateSettings(settings: PlateSolvingSettingsInterface): Observable<PlateSolvingSettingsInterface> {
    let url = this.configUrl + `/settings/${settings.id}/`;
    return this.http.put<PlateSolvingSettingsInterface>(url, settings);
  }

  getAdvancedSettings(solutionId: SolutionInterface["id"]): Observable<PlateSolvingAdvancedSettingsInterface> {
    let url = this.configUrl + "/advanced-settings/";

    url = UtilsService.addOrUpdateUrlParam(url, "solution", solutionId.toString());

    return this.http
      .get<PaginatedApiResultInterface<PlateSolvingAdvancedSettingsInterface>>(url)
      .pipe(
        map(response => {
          if (response.count === 0) {
            return null;
          }
          return response.results[0];
        })
      );
  }

  updateAdvancedSettings(settings: PlateSolvingAdvancedSettingsInterface): Observable<PlateSolvingAdvancedSettingsInterface> {
    let url = this.configUrl + `/advanced-settings/${settings.id}/`;
    return this.http.put<PlateSolvingAdvancedSettingsInterface>(url, settings);
  }

  uploadSampleRawFrameFile(settingsId: PlateSolvingAdvancedSettingsInterface["id"], file: File): Observable<PlateSolvingAdvancedSettingsInterface> {
    const url = this.configUrl + `/advanced-settings/${settingsId}/sample-raw-frame-file/`;
    const formData = new FormData();
    formData.append("sample_raw_frame_file", file);

    const httpOptions = {
      headers: new HttpHeaders({
        // Unsetting the Content-Type is necessary, so it gets set to multipart/form-data with the correct boundary.
        "Content-Type": "__unset__",
        "Content-Disposition": `form-data; name="sample_raw_frame_file"; filename=${encodeURIComponent(file.name)}`
      })
    };

    return this.http.post<PlateSolvingAdvancedSettingsInterface>(url, formData, httpOptions);
  }

  restart(solutionId: SolutionInterface["id"]): Observable<void> {
    const url = this.configUrl + `/solutions/${solutionId}/restart/`;
    return this.http.patch<void>(url, {});
  }
}
