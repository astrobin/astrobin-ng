import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { SolutionInterface } from "@core/interfaces/solution.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class SolutionApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/platesolving/solutions";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getSolution(
    contentType: ContentTypeInterface["id"],
    objectId: string,
    includePixInsightDetails = false
  ): Observable<SolutionInterface> {
    let url = this.configUrl + "/";

    url = UtilsService.addOrUpdateUrlParam(url, "content_type", contentType + "");
    url = UtilsService.addOrUpdateUrlParam(url, "object_id", objectId);
    if (includePixInsightDetails) {
      url = UtilsService.addOrUpdateUrlParam(url, "include-pixinsight-details", "true");
    }

    return this.http.get<SolutionInterface[]>(url).pipe(
      map(response => {
        if (response.length === 0) {
          return null;
        }

        return response[0];
      })
    );
  }

  getSolutions(contentType: number, objectIds: string[]): Observable<SolutionInterface[]> {
    return this.http.get<SolutionInterface[]>(
      `${this.configUrl}/?content_type=${contentType}&object_ids=${objectIds.join(",")}`
    );
  }

  getAdvancedMatrix(solutionId: number): Observable<any> {
    return this.http.get<any>(`${this.configUrl}/${solutionId}/advanced-matrix/`);
  }

  startBasicSolver(contentType: ContentTypeInterface["id"], objectId: string): Observable<void> {
    const url = this.configUrl + "/start/";
    const payload = {
      content_type_id: contentType,
      object_id: objectId
    };

    return this.http.post<void>(url, payload);
  }
}
