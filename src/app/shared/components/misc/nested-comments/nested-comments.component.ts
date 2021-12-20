import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { Observable } from "rxjs";
import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";
import { CreateNestedComment, LoadNestedComments } from "@app/store/actions/nested-comments.actions";
import { selectNestedCommentsByContentTypeIdAndObjectId } from "@app/store/selectors/app/nested-comments.selectors";
import { map, take, takeUntil, tap } from "rxjs/operators";
import { LoadingService } from "@shared/services/loading.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";

@Component({
  selector: "astrobin-nested-comments",
  templateUrl: "./nested-comments.component.html",
  styleUrls: ["./nested-comments.component.scss"]
})
export class NestedCommentsComponent extends BaseComponentDirective implements OnInit {
  @Input()
  contentType: ContentTypeInterface;

  @Input()
  objectId: number;

  @Input()
  highlightId: number;

  @Input()
  info: string;

  comments$: Observable<NestedCommentInterface[]>;
  model: { topLevelComment: string };
  form = new FormGroup({});
  fields: FormlyFieldConfig[];
  showTopLevelForm = false;

  constructor(
    public readonly store$: Store,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit() {
    this._initComments();
    this._initFields();

    this.refresh();
  }

  refresh() {
    this.loadingService.setLoading(true);
    this.store$.dispatch(new LoadNestedComments({ contentTypeId: this.contentType.id, objectId: this.objectId }));
  }

  cancelTopLevelComment() {
    this.form.reset();
    this.showTopLevelForm = false;
  }

  submitTopLevelComment() {
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
  }

  _initComments() {
    this.comments$ = this.store$
      .select(selectNestedCommentsByContentTypeIdAndObjectId, {
        contentTypeId: this.contentType.id,
        objectId: this.objectId
      })
      .pipe(
        takeUntil(this.destroyed$),
        map(comments => UtilsService.sortParent(comments) as NestedCommentInterface[]),
        tap(() => this.loadingService.setLoading(false))
      );
  }

  _initFields() {
    this.fields = [
      {
        key: "topLevelComment",
        type: "ckeditor",
        wrappers: ["default-wrapper"],
        id: "top-level-comment-field",
        templateOptions: {
          required: true
        }
      }
    ];
  }
}
