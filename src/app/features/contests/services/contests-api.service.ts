import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ContestInterface } from "@features/contests/interfaces/contest.interface";
import { ListResponseInterface } from "@shared/interfaces/list-response.interface";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { take, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ContestsApiService extends BaseClassicApiService {
  readonly configUrl = this.baseUrl + "/contests";

  constructor(public loadingService: LoadingService, public http: HttpClient, public commonApi: CommonApiService) {
    super(loadingService);
  }

  list(filters?: { [key: string]: string }): Observable<ListResponseInterface<ContestInterface>> {
    return this.http
      .get<ListResponseInterface<ContestInterface>>(this.configUrl + "/contest/", {
        params: new HttpParams({ fromObject: filters })
      })
      .pipe(
        tap(response => {
          for (const contest of response.results) {
            this.commonApi
              .resolveUser(contest.user)
              .pipe(take(1))
              .subscribe();
          }

          return response;
        })
      );
  }
}
