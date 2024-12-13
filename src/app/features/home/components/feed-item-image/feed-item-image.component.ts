import { Component, Input, ViewContainerRef } from "@angular/core";
import { MainState } from "@app/store/state";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { select, Store } from "@ngrx/store";
import { FeedItemInterface, FeedItemVerb } from "@features/home/interfaces/feed-item.interface";
import { FINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NestedCommentsModalComponent } from "@shared/components/misc/nested-comments-modal/nested-comments-modal.component";
import { LoadContentTypeById } from "@app/store/actions/content-type.actions";
import { selectContentTypeById } from "@app/store/selectors/app/content-type.selectors";
import { filter, take } from "rxjs/operators";
import { NestedCommentsAutoStartTopLevelStrategy } from "@shared/components/misc/nested-comments/nested-comments.component";

@Component({
  selector: "astrobin-feed-item-image",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="feed-item-component feed-item-image">
        <div class="feed-item-header">
          <img
            class="feed-item-avatar"
            [alt]="getDisplayName()"
            [ngSrc]="getUserAvatar()"
            width="60"
            height="60"
          >

          <div class="feed-item-header-text">
            <div class="feed-item-header-text-1">
              {{ getDisplayName() }}
            </div>
            <div class="feed-item-header-text-2">
              <a [routerLink]="['/u', getUserUsername()]">{{ getDisplayName() }}</a>
            </div>
          </div>
        </div>

        <div class="feed-item-body">
          <img
            (click)="openImage()"
            [alt]="getDisplayName()"
            [src]="feedItem.image"
            [style.aspect-ratio]="feedItem.imageW && feedItem.imageH ? feedItem.imageW / feedItem.imageH : 1"
          >
        </div>

        <div class="feed-item-footer">
          <div class="feed-item-footer-text">
            <astrobin-feed-item-display-text [feedItem]="feedItem"></astrobin-feed-item-display-text>
          </div>

          <span class="timestamp">{{ feedItem.timestamp | localDate | timeago }}</span>

          <div
            *ngIf="feedItem.data?.commentHtml"
            [innerHTML]="feedItem.data.commentHtml"
            class="comment-body"
          >
          </div>

          <div class="feed-item-extra d-flex gap-3 mt-4">
            <astrobin-toggle-property
              *ngIf="currentUserWrapper.user?.username !== feedItem.actionObjectUserUsername"
              [contentType]="getContentType()"
              [count]="feedItem.data?.likeCount"
              [objectId]="+(getObjectId())"
              [showLabel]="false"
              [userId]="currentUserWrapper.user?.id"
              class="w-auto m-0"
              btnClass="btn btn-link text-secondary btn-no-block"
              propertyType="like"
            ></astrobin-toggle-property>

            <div class="d-flex align-items-center">
              <fa-icon
                (click)="openComments()"
                [ngbTooltip]="'Comment' | translate"
                [openDelay]="1000"
                container="body"
                icon="comment"
              ></fa-icon>

              <span
                *ngIf="feedItem.data?.commentCount"
                class="count"
              >
                {{ feedItem.data.commentCount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: [
    "../feed-item/feed-item.component.scss",
    "./feed-item-image.component.scss"
  ]
})
export class FeedItemImageComponent extends BaseComponentDirective {
  @Input() feedItem: FeedItemInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageViewerService: ImageViewerService,
    public readonly viewContainerRef: ViewContainerRef,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  protected getContentType() {
    switch (this.feedItem.verb) {
      case FeedItemVerb.VERB_UPLOADED_IMAGE:
      case FeedItemVerb.VERB_LIKED_IMAGE:
      case FeedItemVerb.VERB_BOOKMARKED_IMAGE:
        return this.feedItem.actionObjectContentType;
      case FeedItemVerb.VERB_UPLOADED_REVISION:
      case FeedItemVerb.VERB_COMMENTED_IMAGE:
        return this.feedItem.targetContentType;
      default:
        return null;
    }
  }

  protected getObjectId() {
    switch (this.feedItem.verb) {
      case FeedItemVerb.VERB_UPLOADED_IMAGE:
      case FeedItemVerb.VERB_LIKED_IMAGE:
      case FeedItemVerb.VERB_BOOKMARKED_IMAGE:
        return this.feedItem.actionObjectObjectId;
      case FeedItemVerb.VERB_UPLOADED_REVISION:
      case FeedItemVerb.VERB_COMMENTED_IMAGE:
        return this.feedItem.targetObjectId;
      default:
        return null;
    }
  }

  protected getDisplayName() {
    switch (this.feedItem.verb) {
      case FeedItemVerb.VERB_UPLOADED_IMAGE:
      case FeedItemVerb.VERB_LIKED_IMAGE:
      case FeedItemVerb.VERB_BOOKMARKED_IMAGE:
        return this.feedItem.actionObjectDisplayName;
      case FeedItemVerb.VERB_UPLOADED_REVISION:
      case FeedItemVerb.VERB_COMMENTED_IMAGE:
        return this.feedItem.targetDisplayName;
      default:
        return null;
    }
  }

  protected openImage(): void {
    this.imageViewerService.openSlideshow(
      this.componentId,
      this.getObjectId(),
      FINAL_REVISION_LABEL,
      [],
      this.viewContainerRef,
      true
    ).subscribe();
  }

  protected getUserAvatar(): string {
    switch (this.feedItem.verb) {
      case FeedItemVerb.VERB_UPLOADED_IMAGE:
      case FeedItemVerb.VERB_LIKED_IMAGE:
      case FeedItemVerb.VERB_BOOKMARKED_IMAGE:
        return this.feedItem.actionObjectUserAvatar;
      case FeedItemVerb.VERB_UPLOADED_REVISION:
      case FeedItemVerb.VERB_COMMENTED_IMAGE:
        return this.feedItem.targetUserAvatar;
      default:
        return null;
    }
  }

  protected getUserUsername(): string {
    switch (this.feedItem.verb) {
      case FeedItemVerb.VERB_UPLOADED_IMAGE:
      case FeedItemVerb.VERB_LIKED_IMAGE:
      case FeedItemVerb.VERB_BOOKMARKED_IMAGE:
        return this.feedItem.actionObjectUserUsername;
      case FeedItemVerb.VERB_UPLOADED_REVISION:
      case FeedItemVerb.VERB_COMMENTED_IMAGE:
        return this.feedItem.targetUserUsername;
      default:
        return null;
    }
  }

  protected getUserDisplayName(): string {
    switch (this.feedItem.verb) {
      case FeedItemVerb.VERB_UPLOADED_IMAGE:
      case FeedItemVerb.VERB_LIKED_IMAGE:
      case FeedItemVerb.VERB_BOOKMARKED_IMAGE:
        return this.feedItem.actionObjectUserDisplayName;
      case FeedItemVerb.VERB_UPLOADED_REVISION:
      case FeedItemVerb.VERB_COMMENTED_IMAGE:
        return this.feedItem.targetUserDisplayName;
      default:
        return null;
    }
  }

  protected openComments(): void {
    this.store$.pipe(
      select(selectContentTypeById, {
        id: this.getContentType()
      }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      const modalRef = this.modalService.open(NestedCommentsModalComponent);
      const componentInstance = modalRef.componentInstance as NestedCommentsModalComponent;

      componentInstance.contentType = contentType;
      componentInstance.objectId = +(this.getObjectId());
      componentInstance.title = this.getDisplayName();
      componentInstance.autoStartTopLevelStrategy = NestedCommentsAutoStartTopLevelStrategy.IF_NO_COMMENTS;
    });

    this.store$.dispatch(new LoadContentTypeById({
      id: this.getContentType()
    }));
  }
}
