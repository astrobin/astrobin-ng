import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { Observable } from "rxjs";
import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";
import {
  CreateNestedComment,
  LoadNestedComments,
  LoadNestedCommentsSuccess
} from "@app/store/actions/nested-comments.actions";
import { selectNestedCommentsByContentTypeIdAndObjectId } from "@app/store/selectors/app/nested-comments.selectors";
import { filter, map, take, takeUntil, tap } from "rxjs/operators";
import { LoadingService } from "@shared/services/loading.service";
import { distinctUntilChangedObj, UtilsService } from "@shared/services/utils/utils.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { RouterService } from "@shared/services/router.service";
import { UserInterface } from "@shared/interfaces/user.interface";

export enum NestedCommentsAutoStartTopLevelStrategy {
  ALWAYS = "ALWAYS",
  IF_NO_COMMENTS = "IF_NO_COMMENTS"
}

export type NestedCommentsTopLevelFormPlacement = "TOP" | "BOTTOM";

@Component({
  selector: "astrobin-nested-comments",
  templateUrl: "./nested-comments.component.html",
  styleUrls: ["./nested-comments.component.scss"]
})
export class NestedCommentsComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  contentType: ContentTypeInterface;

  @Input()
  objectId: number;

  @Input()
  highlightId: number;

  @Input()
  title: string = this.translateService.instant("Comments");

  @Input()
  info: string;

  @Input()
  addCommentLabel: string = this.translateService.instant("Add a comment");

  @Input()
  noCommentsLabel: string = this.translateService.instant("There are no comments yet.");

  @Input()
  showCloseButton = false;

  @Input()
  showReplyButton = true;

  @Input()
  allowSelfReply = true;

  @Input()
  showTopLevelButton = true;

  @Input()
  restrictReplyToUserId: UserInterface["id"];

  @Input()
  autoStartTopLevelStrategy: NestedCommentsAutoStartTopLevelStrategy = null;

  @Input()
  topLevelFormPlacement: NestedCommentsTopLevelFormPlacement = "TOP";

  @Input()
  topLevelFormHeight: number;

  @Output()
    // eslint-disable-next-line @angular-eslint/no-output-native
  close = new EventEmitter<void>();

  comments$: Observable<NestedCommentInterface[]>;
  loadingComments = true;
  model: { topLevelComment: string };
  form = new FormGroup({});
  fields: FormlyFieldConfig[];
  showTopLevelForm = false;
  _lastFetchedComments: NestedCommentInterface[] = null;
  _autoStartTopLevelRetries = 0;

  constructor(
    public readonly store$: Store,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly routerService: RouterService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  ngOnChanges() {
    this._initComments();
    this._initFields();

    this.refresh();
  }

  refresh() {
    this.actions$
      .pipe(
        ofType(AppActionTypes.LOAD_NESTED_COMMENTS_SUCCESS),
        filter((action: LoadNestedCommentsSuccess) =>
          action.payload.contentTypeId === this.contentType.id &&
          action.payload.objectId === this.objectId
        ),
        take(1)
      )
      .subscribe(() => (this.loadingComments = false));

    this.loadingComments = true;
    this.store$.dispatch(new LoadNestedComments({ contentTypeId: this.contentType.id, objectId: this.objectId }));
  }

  cancelTopLevelComment() {
    this.form.reset();
    this.showTopLevelForm = false;
  }

  submitTopLevelComment() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.routerService.redirectToLogin();
        return;
      }

      this.store$.dispatch(
        new CreateNestedComment({
          nestedComment: {
            contentType: this.contentType.id,
            objectId: this.objectId,
            text: this.form.get("topLevelComment").value,
            parent: null
          }
        })
      );

      this.actions$
        .pipe(
          ofType(AppActionTypes.CREATE_NESTED_COMMENT_SUCCESS),
          take(1),
          tap(() => this.cancelTopLevelComment())
        )
        .subscribe();
    });
  }

  onAddCommentClicked(event: Event) {
    if (event) {
      event.preventDefault();
    }

    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.routerService.redirectToLogin();
        return;
      }
      this.showTopLevelForm = true;
    });
  }

  _initComments() {
    this.comments$ = this.store$
      .select(selectNestedCommentsByContentTypeIdAndObjectId(
          this.contentType.id,
          this.objectId
        )
      )
      .pipe(
        filter(comments => comments !== null),
        distinctUntilChangedObj(),
        map(comments => UtilsService.sortParent(comments) as NestedCommentInterface[]),
        tap(() => this.loadingService.setLoading(false)),
        tap(comments => {
          this._lastFetchedComments = comments;

          this.utilsService.delay(200).subscribe(() => {
            this._autoStartTopLevel();
          });
        }),
        takeUntil(this.destroyed$)
      );
  }

  _autoStartTopLevel() {
    if (this._autoStartTopLevelRetries >= 10) {
      return;
    }

    this._autoStartTopLevelRetries++;

    if (this.loadingComments) {
      this.utilsService.delay(200).subscribe(() =>
        this._autoStartTopLevel()
      );
      return;
    }

    const comments = this._lastFetchedComments;

    if (
      !this.showTopLevelForm &&
      this.autoStartTopLevelStrategy === NestedCommentsAutoStartTopLevelStrategy.ALWAYS ||
      (
        this.autoStartTopLevelStrategy === NestedCommentsAutoStartTopLevelStrategy.IF_NO_COMMENTS &&
        comments &&
        comments.length === 0
      )
    ) {
      this.onAddCommentClicked(null);
    }
  }

  _initFields() {
    this.fields = [
      {
        key: "topLevelComment",
        type: "ckeditor",
        wrappers: ["default-wrapper"],
        id: `top-level-comment-field-${this.contentType.id}-${this.objectId}`,
        props: {
          required: true,
          height: this.topLevelFormHeight || 300
        }
      }
    ];
  }
}
