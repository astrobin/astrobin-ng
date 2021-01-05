import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SolutionInterface } from "@shared/interfaces/solution.interface";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { SolutionApiServiceInterface } from "@shared/services/api/classic/platesolving/solution/solution-api.service-interface";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class SolutionApiService extends BaseClassicApiService implements SolutionApiServiceInterface {
  configUrl = this.baseUrl + "/platesolving/solutions";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getSolution(contentType: number, objectId: string): Observable<SolutionInterface> {
    return this.http
      .get<SolutionInterface[]>(`${this.configUrl}/?content_type=${contentType}&object_id=${objectId}`)
      .pipe(
        map(response => {
          if (response.length === 0) {
            return null;
          }

          return response[0];
        })
      );
  }
}
