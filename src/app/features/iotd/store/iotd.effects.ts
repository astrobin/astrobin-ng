import { Injectable } from "@angular/core";
import { SubmissionQueueApiService } from "@features/iotd/services/submission-queue-api.service";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { LoadingService } from "@shared/services/loading.service";
import { of } from "rxjs";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { IotdActions, IotdActionTypes, LoadSubmissionQueueFailure, LoadSubmissionQueueSuccess } from "./iotd.actions";

@Injectable()
export class IotdEffects {
  @Effect()
  loadSubmissionQueue$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_SUBMISSION_QUEUE),
    tap(() => this.loadingService.setLoading(true)),
    mergeMap(() =>
      this.submissionQueueApiService.getEntries().pipe(
        map(entries => new LoadSubmissionQueueSuccess(entries.results)),
        catchError(error => of(new LoadSubmissionQueueFailure()))
      )
    )
  );

  @Effect({ dispatch: false })
  loadSubmissionQueueSuccess$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect({ dispatch: false })
  loadSubmissionQueueFailure$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_SUBMISSION_QUEUE_FAILURE),
    tap(() => this.loadingService.setLoading(false))
  );

  constructor(
    public readonly actions$: Actions<IotdActions>,
    public readonly submissionQueueApiService: SubmissionQueueApiService,
    public readonly loadingService: LoadingService
  ) {}
}
