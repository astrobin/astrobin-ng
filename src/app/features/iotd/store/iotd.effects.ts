import { Injectable } from "@angular/core";
import { SubmissionQueueApiService } from "@features/iotd/services/submission-queue-api.service";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@shared/services/loading.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { of } from "rxjs";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import {
  DeleteSubmissionFailure,
  DeleteSubmissionSuccess,
  IotdActions,
  IotdActionTypes,
  LoadSubmissionQueueFailure,
  LoadSubmissionQueueSuccess,
  LoadSubmissionsFailure,
  LoadSubmissionsSuccess,
  PostSubmissionFailure,
  PostSubmissionSuccess
} from "./iotd.actions";

@Injectable()
export class IotdEffects {
  @Effect()
  loadSubmissionQueue$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_SUBMISSION_QUEUE),
    tap(() => this.loadingService.setLoading(true)),
    mergeMap(action =>
      this.submissionQueueApiService.getEntries(action.payload.page).pipe(
        map(entries => new LoadSubmissionQueueSuccess(entries)),
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

  @Effect()
  loadSubmissions$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_SUBMISSIONS),
    tap(() => this.loadingService.setLoading(true)),
    mergeMap(action =>
      this.submissionQueueApiService.getSubmissions().pipe(
        map(submissions => new LoadSubmissionsSuccess(submissions)),
        catchError(error => of(new LoadSubmissionsFailure()))
      )
    )
  );

  @Effect({ dispatch: false })
  loadSubmissionsSuccess$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_SUBMISSIONS_SUCCESS),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect({ dispatch: false })
  loadSubmissionsFailure$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_SUBMISSIONS_FAILURE),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect()
  postSubmission$ = this.actions$.pipe(
    ofType(IotdActionTypes.POST_SUBMISSION),
    tap(() => this.loadingService.setLoading(true)),
    map(action => action.payload),
    mergeMap(payload =>
      this.submissionQueueApiService.postSubmission(payload.imageId).pipe(
        map(response => new PostSubmissionSuccess(response)),
        catchError(error => of(new PostSubmissionFailure(error)))
      )
    )
  );

  @Effect({ dispatch: false })
  postSubmissionSuccess$ = this.actions$.pipe(
    ofType(IotdActionTypes.POST_SUBMISSION_SUCCESS),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect({ dispatch: false })
  postSubmissionFailure$ = this.actions$.pipe(
    ofType(IotdActionTypes.POST_SUBMISSION_FAILURE),
    map(action => action.payload.error),
    tap(error => {
      this.popNotificationsService.error(error);
      this.loadingService.setLoading(false);
    })
  );

  @Effect()
  deleteSubmission$ = this.actions$.pipe(
    ofType(IotdActionTypes.DELETE_SUBMISSION),
    tap(() => this.loadingService.setLoading(true)),
    map(action => action.payload),
    mergeMap(payload =>
      this.submissionQueueApiService.deleteSubmission(payload.id).pipe(
        map(() => new DeleteSubmissionSuccess({ id: payload.id })),
        catchError(error => of(new DeleteSubmissionFailure()))
      )
    )
  );

  @Effect({ dispatch: false })
  deleteSubmissionSuccess$ = this.actions$.pipe(
    ofType(IotdActionTypes.DELETE_SUBMISSION_SUCCESS),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect({ dispatch: false })
  deleteSubmissionFailure$ = this.actions$.pipe(
    ofType(IotdActionTypes.DELETE_SUBMISSION_FAILURE),
    tap(() => this.loadingService.setLoading(false))
  );

  constructor(
    public readonly actions$: Actions<IotdActions>,
    public readonly submissionQueueApiService: SubmissionQueueApiService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService
  ) {}
}
