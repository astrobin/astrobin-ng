import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";
import { Observable } from "rxjs";
import { UserInterface } from "@shared/interfaces/user.interface";
import { selectUser } from "@features/account/store/auth.selectors";
import { take, takeUntil, tap } from "rxjs/operators";
import { LoadUser } from "@features/account/store/auth.actions";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@shared/services/loading.service";
import { CreateNestedComment } from "@app/store/actions/nested-comments.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-nested-comment",
  templateUrl: "./nested-comment.component.html",
  styleUrls: ["./nested-comment.component.scss"]
})
export class NestedCommentComponent extends BaseComponentDirective implements OnInit {
  @Input()
  comment: NestedCommentInterface;

  @Input()
  highlighted = false;

  user$: Observable<UserInterface>;
  replyModel: { topLevelComment: string };
  replyForm = new FormGroup({});
  replyFields: FormlyFieldConfig[];
  showReplyForm = false;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.store$.dispatch(new LoadUser({ id: this.comment.author }));
    this.user$ = this.store$.select(selectUser, this.comment.author).pipe(takeUntil(this.destroyed$));
    this._initReplyFields();
    this._initHighlighted();
  }

  getLink(): string {
    const url = this.windowRefService.getCurrentUrl();
    url.hash = `c${this.comment.id}`;
    return url.href;
  }

  cancelReply() {
    this.replyForm.reset();
    this.showReplyForm = false;
  }

  submitReply() {
    this.store$.dispatch(
      new CreateNestedComment({
        nestedComment: {
          contentType: this.comment.contentType,
          objectId: this.comment.objectId,
          text: this.replyForm.get("commentReply").value,
          parent: this.comment.id
        }
      })
    );

    this.actions$
      .pipe(
        ofType(AppActionTypes.CREATE_NESTED_COMMENT_SUCCESS),
        take(1),
        tap(() => this.cancelReply())
      )
      .subscribe();
  }

  _initReplyFields() {
    this.replyFields = [
      {
        key: "commentReply",
        type: "ckeditor",
        wrappers: ["default-wrapper"],
        id: `reply-comment-field-${this.comment.id}`,
        templateOptions: {
          required: true
        }
      }
    ];
  }

  _initHighlighted() {
    const hash = this.windowRefService.getCurrentUrl().hash;

    if (hash === `#c${this.comment.id}`) {
      this.highlighted = true;
    }

    if (this.highlighted) {
      setTimeout(() => {
        this.windowRefService.nativeWindow.document
          .querySelector(`#c${this.comment.id}`)
          .scrollIntoView({ behavior: "smooth" });
      }, 1);
    }
  }
}
