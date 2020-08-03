import { Injectable } from "@angular/core";
import { ContestInterface } from "@features/contests/interfaces/contest.interface";
import { ContestsApiService } from "@features/contests/services/contests-api.service";
import { ContestsServiceInterface } from "@features/contests/services/contests.service-interface";
import { ListResponseInterface } from "@shared/interfaces/list-response.interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import moment from "moment";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ContestsService extends BaseService implements ContestsServiceInterface {
  constructor(public loadingService: LoadingService, public contestsApi: ContestsApiService) {
    super(loadingService);
  }

  listRunning(): Observable<ListResponseInterface<ContestInterface>> {
    this.loadingSubject.next(true);

    return this.contestsApi
      .list({ start_date__lte: this._now(), end_date__gt: this._now() })
      .pipe(tap(() => this.loadingSubject.next(false)));
  }

  listOpen(): Observable<ListResponseInterface<ContestInterface>> {
    this.loadingSubject.next(true);

    return this.contestsApi.list({ start_date__gt: this._now() }).pipe(tap(() => this.loadingSubject.next(false)));
  }

  listClosed(): Observable<ListResponseInterface<ContestInterface>> {
    this.loadingSubject.next(true);

    return this.contestsApi.list({ end_date__lt: this._now() }).pipe(tap(() => this.loadingSubject.next(false)));
  }

  private _now(): string {
    return moment().format("YYYY-MM-DD");
  }
}
