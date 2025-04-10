import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import {
  UpdateNestedComment,
  ApproveNestedCommentFailure,
  ApproveNestedCommentSuccess,
  CreateNestedCommentFailure,
  CreateNestedCommentSuccess,
  DeleteNestedCommentFailure,
  DeleteNestedCommentSuccess,
  LoadNestedCommentFailure,
  LoadNestedCommentsSuccess,
  LoadNestedCommentSuccess,
  UpdateNestedCommentFailure,
  UpdateNestedCommentSuccess
} from "@app/store/actions/nested-comments.actions";
import { selectNestedCommentById } from "@app/store/selectors/app/nested-comments.selectors";
import { MainState } from "@app/store/state";
import { NestedCommentInterface } from "@core/interfaces/nested-comment.interface";
import { NestedCommentsApiService } from "@core/services/api/classic/nested-comments/nested-comments-api.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { Observable, fromEvent, of } from "rxjs";
import { catchError, debounceTime, filter, first, map, mapTo, mergeMap, take, tap } from "rxjs/operators";

@Injectable()
export class NestedCommentsEffects {
  LoadNestedComments: Observable<LoadNestedCommentsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_NESTED_COMMENTS),
      map(action => action.payload),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(payload =>
        this.nestedCommentsApiService.getForContentTypeIdAndObjectId(payload.contentTypeId, payload.objectId).pipe(
          map(
            nestedComments =>
              new LoadNestedCommentsSuccess({
                contentTypeId: payload.contentTypeId,
                objectId: payload.objectId,
                nestedComments
              })
          ),
          tap(() => this.loadingService.setLoading(false))
        )
      )
    )
  );

  LoadNestedComment: Observable<LoadNestedCommentSuccess | LoadNestedCommentFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_NESTED_COMMENT),
      map(action => action.payload),
      mergeMap(payload =>
        this.nestedCommentsApiService.getById(payload.id).pipe(
          map(nestedComment => new LoadNestedCommentSuccess({ nestedComment })),
          catchError(() => of(new LoadNestedCommentFailure({ id: payload.id })))
        )
      )
    )
  );

  CreateNestedComment: Observable<CreateNestedCommentSuccess | CreateNestedCommentFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.CREATE_NESTED_COMMENT),
      map(action => action.payload.nestedComment),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(nestedComment =>
        this.nestedCommentsApiService.create(nestedComment).pipe(
          map(newNestedComment => new CreateNestedCommentSuccess({ nestedComment: newNestedComment })),
          catchError(() => of(new CreateNestedCommentFailure({ nestedComment })))
        )
      )
    )
  );

  CreateNestedCommentSuccess: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.CREATE_NESTED_COMMENT_SUCCESS),
        map(action => UtilsService.objectToCamelCase(action.payload.nestedComment)),
        tap((nestedComment: NestedCommentInterface) => {
          this.loadingService.setLoading(false);

          this.store$
            .select(selectNestedCommentById, nestedComment.id)
            .pipe(
              filter(selectedNestedComment => !!selectedNestedComment),
              take(1)
            )
            .subscribe(selectedNestedComment => {
              this.utilsService.delay(1).subscribe(() => {
                const element = this.windowRefService.nativeWindow.document.getElementById(`c${nestedComment.id}`);
                element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
                if (isPlatformBrowser(this.platformId)) {
                  fromEvent(this.windowRefService.nativeWindow, "scroll")
                    .pipe(debounceTime(50), first(), mapTo(true))
                    .subscribe(() => {
                      element.classList.add("created");

                      this.utilsService.delay(1000).subscribe(() => {
                        element.classList.remove("created");
                      });
                    });
                }
              });
            });
        }),
        map(() => void 0)
      ),
    { dispatch: false }
  );

  CreateNestedCommentFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.CREATE_NESTED_COMMENT_FAILURE),
        map(action => action.payload.nestedComment),
        tap(() => this.loadingService.setLoading(false)),
        map(() => void 0)
      ),
    { dispatch: false }
  );

  UpdateNestedComment: Observable<UpdateNestedCommentSuccess | UpdateNestedCommentFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.UPDATE_NESTED_COMMENT),
      map((action: UpdateNestedComment) => action.payload.nestedComment),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(nestedComment =>
        this.nestedCommentsApiService.update(nestedComment).pipe(
          map(updatedNestedComment => new UpdateNestedCommentSuccess({ nestedComment: updatedNestedComment })),
          catchError(() => of(new UpdateNestedCommentFailure({ nestedComment })))
        )
      )
    )
  );

  UpdateNestedCommentSuccess: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.UPDATE_NESTED_COMMENT_SUCCESS),
        map((action: UpdateNestedCommentSuccess) => action.payload.nestedComment),
        tap(() => this.loadingService.setLoading(false)),
        map(() => void 0)
      ),
    { dispatch: false }
  );

  UpdateNestedCommentFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.UPDATE_NESTED_COMMENT_FAILURE),
        map((action: UpdateNestedCommentFailure) => action.payload.nestedComment),
        tap(() => {
          this.loadingService.setLoading(false);
          this.popNotificationsService.error(
            this.translateService.instant("Something went wrong while updating the comment. Please try again later.")
          );
        }),
        map(() => void 0)
      ),
    { dispatch: false }
  );

  ApproveNestedComment: Observable<ApproveNestedCommentSuccess | ApproveNestedCommentFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.APPROVE_NESTED_COMMENT),
      map(action => action.payload.id),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(id =>
        this.nestedCommentsApiService.approve(id).pipe(
          map(nestedComment => new ApproveNestedCommentSuccess({ nestedComment })),
          catchError(error => of(new ApproveNestedCommentFailure({ id, error })))
        )
      )
    )
  );

  ApproveNestedCommentSuccess: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.APPROVE_NESTED_COMMENT_SUCCESS),
        map(action => action.payload.nestedComment),
        tap(() => this.loadingService.setLoading(false)),
        map(() => void 0)
      ),
    { dispatch: false }
  );

  ApproveNestedCommentFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.APPROVE_NESTED_COMMENT_FAILURE),
        map(action => action.payload.id),
        tap(() => {
          this.loadingService.setLoading(false);
          this.popNotificationsService.error(
            this.translateService.instant("Something went wrong while approving the comment. Please try again later.")
          );
        }),
        map(() => void 0)
      ),
    { dispatch: false }
  );

  DeleteNestedComment: Observable<DeleteNestedCommentSuccess | DeleteNestedCommentFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.DELETE_NESTED_COMMENT),
      map(action => action.payload.id),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(id =>
        this.nestedCommentsApiService.delete(id).pipe(
          map(() => new DeleteNestedCommentSuccess({ id })),
          catchError(error => of(new DeleteNestedCommentFailure({ id, error })))
        )
      )
    )
  );

  DeleteNestedCommentSuccess: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.DELETE_NESTED_COMMENT_SUCCESS),
        map(action => action.payload.id),
        tap(() => this.loadingService.setLoading(false)),
        map(() => void 0)
      ),
    { dispatch: false }
  );

  DeleteNestedCommentFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.DELETE_NESTED_COMMENT_FAILURE),
        map(action => action.payload.id),
        tap(() => {
          this.loadingService.setLoading(false);
          this.popNotificationsService.error(
            this.translateService.instant("Something went wrong while deleting the comment. Please try again later.")
          );
        }),
        map(() => void 0)
      ),
    { dispatch: false }
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public readonly loadingService: LoadingService,
    public readonly nestedCommentsApiService: NestedCommentsApiService,
    public readonly windowRefService: WindowRefService,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService
  ) {}
}
