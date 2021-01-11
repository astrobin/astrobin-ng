import { Injectable } from "@angular/core";
import { LoadImages } from "@app/store/actions/image.actions";
import { selectImages } from "@app/store/selectors/app/image.selectors";
import { State } from "@app/store/state";
import { ReviewQueueApiService } from "@features/iotd/services/review-queue-api.service";
import { SubmissionQueueApiService } from "@features/iotd/services/submission-queue-api.service";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@shared/services/loading.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { of } from "rxjs";
import { catchError, map, mergeMap, skip, switchMap, take, tap } from "rxjs/operators";
import {
  DeleteSubmissionFailure,
  DeleteSubmissionSuccess,
  DeleteVoteFailure,
  DeleteVoteSuccess,
  InitHiddenReviewEntriesSuccess,
  InitHiddenSubmissionEntriesSuccess,
  IotdActions,
  IotdActionTypes,
  LoadReviewQueueFailure,
  LoadReviewQueueSuccess,
  LoadSubmissionQueueFailure,
  LoadSubmissionQueueSuccess,
  LoadSubmissionsFailure,
  LoadSubmissionsSuccess,
  LoadVotesFailure,
  LoadVotesSuccess,
  PostSubmissionFailure,
  PostSubmissionSuccess,
  PostVoteFailure,
  PostVoteSuccess
} from "./iotd.actions";

@Injectable()
export class IotdEffects {
  readonly HIDDEN_SUBMISSION_ENTRIES_KEY = "iotd.hidden-submissions";
  readonly HIDDEN_REVIEW_ENTRIES_KEY = "iotd.hidden-review-entries";

  @Effect()
  loadSubmissionQueue$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_SUBMISSION_QUEUE),
    tap(() => this.loadingService.setLoading(true)),
    mergeMap(action =>
      this.submissionQueueApiService.getEntries(action.payload.page).pipe(
        tap(entries => this.store$.dispatch(new LoadImages(entries.results.map(entry => entry.pk)))),
        switchMap(entries =>
          this.store$.select(selectImages).pipe(
            skip(1),
            take(1),
            map(images => entries)
          )
        ),
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
      this.submissionQueueApiService.addSubmission(payload.imageId).pipe(
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
      this.submissionQueueApiService.retractSubmission(payload.id).pipe(
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

  @Effect()
  initHiddenSubmissionEntries$ = this.actions$.pipe(
    ofType(IotdActionTypes.INIT_HIDDEN_SUBMISSION_ENTRIES),
    map(() => {
      const localStorage = this.windowRef.nativeWindow.localStorage;
      const value = JSON.parse(localStorage.getItem(this.HIDDEN_SUBMISSION_ENTRIES_KEY)) || [];
      return new InitHiddenSubmissionEntriesSuccess({ ids: value });
    })
  );

  @Effect({ dispatch: false })
  initHiddenSubmissionEntriesSuccess$ = this.actions$.pipe(
    ofType(IotdActionTypes.INIT_HIDDEN_SUBMISSION_ENTRIES_SUCCESS)
  );

  @Effect({ dispatch: false })
  hideSubmissionEntry$ = this.actions$.pipe(
    ofType(IotdActionTypes.HIDE_SUBMISSION_ENTRY),
    map(action => action.payload),
    tap(payload => {
      const localStorage = this.windowRef.nativeWindow.localStorage;
      const current = JSON.parse(localStorage.getItem(this.HIDDEN_SUBMISSION_ENTRIES_KEY)) || [];
      localStorage.setItem(this.HIDDEN_SUBMISSION_ENTRIES_KEY, JSON.stringify([...current, payload.id]));
    })
  );

  @Effect()
  loadReviewQueue$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_REVIEW_QUEUE),
    tap(() => this.loadingService.setLoading(true)),
    mergeMap(action =>
      this.reviewQueueApiService.getEntries(action.payload.page).pipe(
        tap(entries => this.store$.dispatch(new LoadImages(entries.results.map(entry => entry.pk)))),
        switchMap(entries =>
          this.store$.select(selectImages).pipe(
            skip(1),
            take(1),
            map(images => entries)
          )
        ),
        map(entries => new LoadReviewQueueSuccess(entries)),
        catchError(() => of(new LoadReviewQueueFailure()))
      )
    )
  );

  @Effect({ dispatch: false })
  loadReviewQueueSuccess$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_REVIEW_QUEUE_SUCCESS),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect({ dispatch: false })
  loadReviewQueueFailure$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_REVIEW_QUEUE_FAILURE),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect()
  loadVotes$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_VOTES),
    tap(() => this.loadingService.setLoading(true)),
    mergeMap(action =>
      this.reviewQueueApiService.getVotes().pipe(
        map(reviews => new LoadVotesSuccess(reviews)),
        catchError(error => of(new LoadVotesFailure()))
      )
    )
  );

  @Effect({ dispatch: false })
  loadVotesSuccess$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_VOTES_SUCCESS),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect({ dispatch: false })
  loadVotesFailure$ = this.actions$.pipe(
    ofType(IotdActionTypes.LOAD_VOTES_FAILURE),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect()
  postVote$ = this.actions$.pipe(
    ofType(IotdActionTypes.POST_VOTE),
    tap(() => this.loadingService.setLoading(true)),
    map(action => action.payload),
    mergeMap(payload =>
      this.reviewQueueApiService.addVote(payload.imageId).pipe(
        map(response => new PostVoteSuccess(response)),
        catchError(error => of(new PostVoteFailure(error)))
      )
    )
  );

  @Effect({ dispatch: false })
  postVoteSuccess$ = this.actions$.pipe(
    ofType(IotdActionTypes.POST_VOTE_SUCCESS),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect({ dispatch: false })
  postVoteFailure$ = this.actions$.pipe(
    ofType(IotdActionTypes.POST_VOTE_FAILURE),
    map(action => action.payload.error),
    tap(error => {
      this.popNotificationsService.error(error);
      this.loadingService.setLoading(false);
    })
  );

  @Effect()
  deleteVote$ = this.actions$.pipe(
    ofType(IotdActionTypes.DELETE_VOTE),
    tap(() => this.loadingService.setLoading(true)),
    map(action => action.payload),
    mergeMap(payload =>
      this.reviewQueueApiService.retractVote(payload.id).pipe(
        map(() => new DeleteVoteSuccess({ id: payload.id })),
        catchError(() => of(new DeleteVoteFailure()))
      )
    )
  );

  @Effect({ dispatch: false })
  deleteVoteSuccess$ = this.actions$.pipe(
    ofType(IotdActionTypes.DELETE_VOTE_SUCCESS),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect({ dispatch: false })
  deleteVoteFailure$ = this.actions$.pipe(
    ofType(IotdActionTypes.DELETE_VOTE_FAILURE),
    tap(() => this.loadingService.setLoading(false))
  );

  @Effect()
  initHiddenReviewEntries$ = this.actions$.pipe(
    ofType(IotdActionTypes.INIT_HIDDEN_REVIEW_ENTRIES),
    map(() => {
      const localStorage = this.windowRef.nativeWindow.localStorage;
      const value = JSON.parse(localStorage.getItem(this.HIDDEN_REVIEW_ENTRIES_KEY)) || [];
      return new InitHiddenReviewEntriesSuccess({ ids: value });
    })
  );

  @Effect({ dispatch: false })
  initHiddenReviewEntriesSuccess$ = this.actions$.pipe(ofType(IotdActionTypes.INIT_HIDDEN_REVIEW_ENTRIES_SUCCESS));

  @Effect({ dispatch: false })
  hideReviewEntry$ = this.actions$.pipe(
    ofType(IotdActionTypes.HIDE_REVIEW_ENTRY),
    map(action => action.payload),
    tap(payload => {
      const localStorage = this.windowRef.nativeWindow.localStorage;
      const current = JSON.parse(localStorage.getItem(this.HIDDEN_REVIEW_ENTRIES_KEY)) || [];
      localStorage.setItem(this.HIDDEN_REVIEW_ENTRIES_KEY, JSON.stringify([...current, payload.id]));
    })
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions<IotdActions>,
    public readonly submissionQueueApiService: SubmissionQueueApiService,
    public readonly reviewQueueApiService: ReviewQueueApiService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly windowRef: WindowRefService
  ) {}
}
