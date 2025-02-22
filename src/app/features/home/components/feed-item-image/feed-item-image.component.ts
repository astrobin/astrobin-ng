import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild, ViewContainerRef } from "@angular/core";
import { MainState } from "@app/store/state";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { select, Store } from "@ngrx/store";
import { FeedItemInterface, FeedItemVerb } from "@features/home/interfaces/feed-item.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NestedCommentsModalComponent } from "@shared/components/misc/nested-comments-modal/nested-comments-modal.component";
import { LoadContentTypeById } from "@app/store/actions/content-type.actions";
import { selectContentTypeById } from "@app/store/selectors/app/content-type.selectors";
import { catchError, filter, take } from "rxjs/operators";
import { NestedCommentsAutoStartTopLevelStrategy } from "@shared/components/misc/nested-comments/nested-comments.component";
import { WindowRefService } from "@core/services/window-ref.service";
import { SafeHtml } from "@angular/platform-browser";
import { JsonApiService } from "@core/services/api/classic/json/json-api.service";
import { TranslateService } from "@ngx-translate/core";
import { EMPTY } from "rxjs";

@Component({
  selector: "astrobin-feed-item-image",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="feed-item-component feed-item-image">
        <div class="feed-item-header">
          <img
            class="feed-item-avatar"
            [alt]="displayName"
            [ngSrc]="userAvatar"
            width="60"
            height="60"
            loading="lazy"
          >

          <div class="feed-item-header-text">
            <div class="feed-item-header-text-1">
              <a
                (click)="onClick($event)"
                [href]="'/i/' + objectId"
                astrobinEventPreventDefault
                astrobinEventStopPropagation
                class="item-display-name"
              >
                {{ displayName }}
              </a>
            </div>
            <div class="feed-item-header-text-2">
              <a [routerLink]="['/u', userUsername]">{{ userDisplayName }}</a>
            </div>
          </div>
        </div>

        <div class="feed-item-body">
          <a
            (click)="onClick($event)"
            [href]="'/i/' + objectId"
            astrobinEventPreventDefault
            astrobinEventStopPropagation
            class="main-image-container"
          >
            <img
              #image
              [alt]="displayName"
              [src]="feedItem.image"
              class="main-image"
              loading="lazy"
            >
          </a>
        </div>

        <div class="feed-item-footer">
          <div class="feed-item-footer-text">
            <astrobin-feed-item-display-text [feedItem]="feedItem"></astrobin-feed-item-display-text>
          </div>

          <ng-container *ngIf="feedItem.data?.commentHtml">
            <div
              *ngIf="!translatedHtml"
              [innerHTML]="feedItem.data.commentHtml"
              class="comment-body d-md-none"
            >
            </div>

            <div
              *ngIf="translatedHtml"
              [innerHTML]="translatedHtml"
              class="comment-body d-md-none"
            >
            </div>

            <div
              *ngIf="
                feedItem.data?.commentHtml &&
                feedItem.data?.commentLanguage &&
                feedItem.data?.commentLanguage !== translateService.currentLang &&
                currentUserWrapper.user
              "
              class="translate-button d-md-none"
            >
              <button
                *ngIf="!translatedHtml"
                (click)="onTranslateCommentClicked($event)"
                [class.loading]="translating"
                class="btn btn-link btn-sm w-auto btn-no-block text-muted text-start mb-3"
              >
                <fa-icon icon="language"></fa-icon>
                {{ "Translate" | translate }}
              </button>

              <button
                *ngIf="translatedHtml"
                (click)="onSeeOriginalCommentClicked($event)"
                class="btn btn-link btn-sm w-auto btn-no-block text-muted text-start mb-3"
              >
                <fa-icon icon="eye"></fa-icon>
                {{ "See original" | translate }}
              </button>
            </div>
          </ng-container>

          <div class="feed-item-extra d-flex justify-content-between align-items-center">
            <span class="timestamp">
              {{ feedItem.timestamp | localDate | timeago }}
            </span>

            <div class="d-flex gap-3">
              <astrobin-toggle-property
                *ngIf="currentUserWrapper.user?.username !== feedItem.actionObjectUserUsername"
                [contentType]="contentType"
                [count]="feedItem.data?.likeCount"
                [objectId]="+objectId"
                [showLabel]="false"
                [showLoadingIndicator]="false"
                [showTooltip]="false"
                [userId]="currentUserWrapper.user?.id"
                class="w-auto m-0"
                btnClass="btn btn-link text-secondary btn-no-block"
                propertyType="like"
              ></astrobin-toggle-property>

              <div class="d-flex align-items-center">
                <fa-icon (click)="openComments()" icon="comment"></fa-icon>
                <span *ngIf="feedItem.data?.commentCount" class="count">
                {{ feedItem.data.commentCount }}
              </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: [
    "../feed-item/feed-item.component.scss",
    "./feed-item-image.component.scss"
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedItemImageComponent extends BaseComponentDirective implements OnChanges {
  @Input() feedItem: FeedItemInterface;
  @Output() readonly openImage = new EventEmitter<ImageInterface["hash"] | ImageInterface["pk"]>();
  @ViewChild('image') imageElement: ElementRef<HTMLImageElement>;

  protected contentType: number;
  protected objectId: string;
  protected displayName: string;
  protected userUsername: string;
  protected userDisplayName: string;
  protected userAvatar: string;
  protected translating = false;
  protected translatedHtml: SafeHtml;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageViewerService: ImageViewerService,
    public readonly viewContainerRef: ViewContainerRef,
    public readonly modalService: NgbModal,
    public readonly windowRefService: WindowRefService,
    public readonly jsonApiService: JsonApiService,
    public readonly translateService: TranslateService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnChanges(): void {
    this.contentType = this._getContentType();
    this.objectId = this._getObjectId();
    this.displayName = this._getDisplayName();
    this.userUsername = this._getUserUsername();
    this.userDisplayName = this._getUserDisplayName();
    this.userAvatar = this._getUserAvatar();
  }

  protected onClick(event: MouseEvent): void {
    if (event.metaKey || event.ctrlKey) {
      this.windowRefService.nativeWindow.open(`/i/${this.objectId}`, "_blank");
      return;
    }

    this.openImage.emit(this.objectId);
  }

  protected openComments(): void {
    this.store$.pipe(
      select(selectContentTypeById, {
        id: this._getContentType()
      }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      const modalRef = this.modalService.open(NestedCommentsModalComponent);
      const componentInstance = modalRef.componentInstance as NestedCommentsModalComponent;

      componentInstance.contentType = contentType;
      componentInstance.objectId = +(this._getObjectId());
      componentInstance.title = this._getDisplayName();
      componentInstance.autoStartTopLevelStrategy = NestedCommentsAutoStartTopLevelStrategy.IF_NO_COMMENTS;
    });

    this.store$.dispatch(new LoadContentTypeById({
      id: this._getContentType()
    }));
  }

  protected onTranslateCommentClicked(event: MouseEvent): void {
    event.preventDefault();

    this.translating = true;
    this.jsonApiService.translate(
      this.feedItem.data.commentHtml,
      this.feedItem.data.commentLanguage,
      this.translateService.currentLang,
      {
        format: "html"
      }
    ).pipe(
      catchError(() => {
        this.translating = false;
        this.translatedHtml = null;
        this.changeDetectorRef.markForCheck();
        return EMPTY;
      })
    ).subscribe(response => {
      if (response) {
        this.translatedHtml = response.translation;
        this.translating = false;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected onSeeOriginalCommentClicked(event: MouseEvent): void {
    event.preventDefault();
    this.translatedHtml = null;
    this.changeDetectorRef.markForCheck();
  }

  private _getUserAvatar(): string {
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

  private _getContentType(): number {
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

  private _getObjectId(): string {
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

  private _getDisplayName(): string {
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

  private _getUserUsername(): string {
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

  private _getUserDisplayName(): string {
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
}
