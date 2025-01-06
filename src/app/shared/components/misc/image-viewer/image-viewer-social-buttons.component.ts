import { Component, Inject, Input, OnInit, PLATFORM_ID, TemplateRef, ViewChild } from "@angular/core";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { debounceTime, distinctUntilChanged, filter, take, takeUntil, tap } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { isPlatformBrowser } from "@angular/common";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Observable, Subject } from "rxjs";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { ForceCheckTogglePropertyAutoLoad } from "@app/store/actions/image.actions";
import { LoadingService } from "@shared/services/loading.service";


@Component({
  selector: "astrobin-image-viewer-social-buttons",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="social-buttons d-flex gap-2 align-items-center">
        <ng-container *ngIf="imageContentType && currentUserWrapper$ | async as currentUserWrapper">
          <div *ngIf="showLike" class="like">
            <astrobin-toggle-property
              *ngIf="!!image && !!currentUserWrapper.user && currentUserWrapper.user.id !== image.user"
              [contentType]="imageContentType.id"
              [objectId]="image?.pk"
              [showLabel]="false"
              [userId]="currentUserWrapper.user?.id"
              [count]="initialLikeCount"
              class="btn-no-block"
              btnClass="btn btn-no-block {{ btnExtraClasses }}"
              propertyType="like"
            ></astrobin-toggle-property>

            <div
              *ngIf="!!image && !!currentUserWrapper.user && currentUserWrapper.user.id === image.user"
              (click)="openLikeThisOffcanvas()"
              class="like-count me-3"
            >
              <fa-icon icon="thumbs-up"></fa-icon>
              <span class="ms-2">{{ image.likeCount }}</span>
            </div>
          </div>

          <div *ngIf="showBookmark" class="bookmark">
            <astrobin-toggle-property
              *ngIf="!!image && !!currentUserWrapper.user && currentUserWrapper.user.id !== image.user"
              [contentType]="imageContentType.id"
              [objectId]="image?.pk"
              [userId]="currentUserWrapper.user?.id"
              [showLabel]="false"
              [count]="initialBookmarkCount"
              class="btn-no-block"
              btnClass="btn btn-no-block {{ btnExtraClasses }}"
              propertyType="bookmark"
            ></astrobin-toggle-property>

            <div
              *ngIf="!!image && !!currentUserWrapper.user && currentUserWrapper.user.id === image.user"
              (click)="openBookmarkedThisOffcanvas()"
              class="bookmark-count me-3"
            >
              <fa-icon icon="bookmark"></fa-icon>
              <span class="ms-2">{{ image.bookmarkCount }}</span>
            </div>
          </div>

          <div *ngIf="image?.allowComments && showComments" class="comment">
            <button
              (click)="scrollToComments($event)"
              class="btn btn-no-block {{ btnExtraClasses }}"
            >
              <fa-icon
                [ngbTooltip]="'Comments' | translate"
                triggers="hover click"
                container="body"
                icon="comments"
              ></fa-icon>

              <span class="count">
                <astrobin-nested-comments-count
                  [contentType]="imageContentType"
                  [objectId]="image?.pk"
                ></astrobin-nested-comments-count>
              </span>
            </button>
          </div>

          <div *ngIf="showShare" class="share">
            <astrobin-image-viewer-share-button
              [image]="image"
              [revisionLabel]="revisionLabel"
            ></astrobin-image-viewer-share-button>
          </div>
        </ng-container>
      </div>
    </ng-container>

    <ng-template #likeThisOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" translate="People who like this"></h5>
        <button
          type="button"
          class="btn-close"
          (click)="offcanvas.close()"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body" *ngIf="currentUserWrapper$ | async as currentUserWrapper">
        <div *ngIf="likeThis; else loadingTemplate" class="d-flex flex-column gap-1">
          <input
            *ngIf="likeThis && likeThis.length > 0"
            type="search"
            class="form-control mb-2"
            placeholder="{{ 'Search' | translate }}"
            [ngModelOptions]="{standalone: true}"
            [(ngModel)]="likeThisSearch"
            (ngModelChange)="likeThisSearchSubject.next($event)"
          />
          <ng-container *ngIf="!searching; else loadingTemplate">
            <table *ngIf="likeThis && likeThis.length > 0; else nothingHereTemplate" class="table table-sm table-striped">
              <tbody>
                <tr *ngFor="let like of likeThis">
                  <td>
                    <a [routerLink]="['/u', like.username]">
                      {{ like.displayName || like.username }}
                    </a>
                    <div class="d-md-none">
                      {{ like.timestamp | localDate | timeago: true }}
                    </div>
                  </td>
                  <td class="d-none d-lg-table-cell">
                    {{ like.timestamp | localDate | timeago: true }}
                  </td>
                  <td class="text-end">
                    <astrobin-toggle-property
                      *ngIf="!!currentUserWrapper.user && currentUserWrapper.user.id !== like.userId"
                      [userId]="currentUserWrapper.user.id"
                      [contentType]="userContentType.id"
                      [objectId]="like.userId"
                      [propertyType]="'follow'"
                      class="d-block"
                      btnClass="btn btn-sm btn-outline-secondary"
                    ></astrobin-toggle-property>
                  </td>
                </tr>
              </tbody>
            </table>
          </ng-container>
        </div>
      </div>
    </ng-template>

    <ng-template #bookmarkedThisOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title" translate="People who bookmarked this"></h5>
        <button
          type="button"
          class="btn-close"
          (click)="offcanvas.close()"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body" *ngIf="currentUserWrapper$ | async as currentUserWrapper">
        <astrobin-toggle-property
          *ngIf="!!currentUserWrapper.user && currentUserWrapper.user.id === image.user"
          [userId]="currentUserWrapper.user.id"
          [contentType]="imageContentType.id"
          [objectId]="image.pk"
          [propertyType]="'bookmark'"
          [setLabel]="'Bookmark your own image' | translate"
          class="d-block mb-3"
          btnClass="btn btn-primary"
        ></astrobin-toggle-property>

        <div *ngIf="bookmarkedThis; else loadingTemplate" class="d-flex flex-column gap-1">
          <input
            *ngIf="bookmarkedThis && bookmarkedThis.length > 0"
            type="search"
            class="form-control mb-2"
            placeholder="{{ 'Search' | translate }}"
            [ngModelOptions]="{standalone: true}"
            [(ngModel)]="bookmarkedThisSearch"
            (ngModelChange)="bookmarkedThisSearchSubject.next($event)"
          />
          <ng-container *ngIf="!searching; else loadingTemplate">
            <table *ngIf="bookmarkedThis && bookmarkedThis.length > 0; else nothingHereTemplate" class="table table-sm table-striped">
              <tbody>
              <tr *ngFor="let bookmark of bookmarkedThis">
                <td>
                  <a [routerLink]="['/u', bookmark.username]">
                    {{ bookmark.displayName || bookmark.username }}
                  </a>
                  <div class="d-md-none">
                    {{ bookmark.timestamp | localDate | timeago: true }}
                  </div>
                </td>
                <td class="d-none d-lg-table-cell">
                  {{ bookmark.timestamp | localDate | timeago: true }}
                </td>
                <td class="text-end">
                  <astrobin-toggle-property
                    *ngIf="!!currentUserWrapper.user && currentUserWrapper.user.id !== bookmark.userId"
                    [userId]="currentUserWrapper.user.id"
                    [contentType]="userContentType.id"
                    [objectId]="bookmark.userId"
                    [propertyType]="'follow'"
                    class="d-block"
                    btnClass="btn btn-sm btn-outline-secondary"
                  ></astrobin-toggle-property>
                </td>
              </tr>
              </tbody>
            </table>
          </ng-container>
        </div>
      </div>
    </ng-template>

    <ng-template #nothingHereTemplate>
      <astrobin-nothing-here [withAlert]="false" [withInfoSign]="false"></astrobin-nothing-here>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-social-buttons.component.scss"]
})
export class ImageViewerSocialButtonsComponent extends ImageViewerSectionBaseComponent implements OnInit {
  @Input()
  image: ImageInterface;

  @Input()
  revision: ImageInterface | ImageRevisionInterface;

  @Input() showLike = true;
  @Input() showBookmark = true;
  @Input() showComments = true;
  @Input() showShare = true;
  @Input() btnExtraClasses = ""

  @ViewChild("shareTemplate") shareTemplate: TemplateRef<any>;
  @ViewChild("likeThisOffcanvas") likeThisOffcanvas: TemplateRef<any>;
  @ViewChild("bookmarkedThisOffcanvas") bookmarkedThisOffcanvas: TemplateRef<any>;

  protected userContentType: ContentTypeInterface;
  protected imageContentType: ContentTypeInterface;
  protected searching = false;

  protected likeThis: {userId: number; username: string; displayName: string, timestamp: string;}[] = [];
  protected likeThisSearch: string;
  protected likeThisSearchSubject = new Subject<string>();

  protected bookmarkedThis: {userId: number; username: string; displayName: string, timestamp: string;}[] = [];
  protected bookmarkedThisSearch: string;
  protected bookmarkedThisSearchSubject = new Subject<string>();


  protected initialLikeCount: number;
  protected initialBookmarkCount: number;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly imageService: ImageService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly windowRefService: WindowRefService,
    public readonly translateService: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly utilsService: UtilsService,
    public readonly imageApiService: ImageApiService,
    public readonly loadingService: LoadingService
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);

    this.store$.pipe(
      select(selectContentType, { appLabel: "astrobin", model: "image" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.imageContentType = contentType;
    });

    this.store$.pipe(
      select(selectContentType, { appLabel: "auth", model: "user" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.userContentType = contentType;
    });

    this.store$.dispatch(new LoadContentType({
      appLabel: "auth",
      model: "user"
    }));
  }

  ngOnInit() {
    super.ngOnInit();

    this.initialLikeCount = this.image.likeCount;
    this.initialBookmarkCount = this.image.bookmarkCount;

    this.likeThisSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(search => {
      this._searchUsersWhoLikeThis(search);
    });

    this.bookmarkedThisSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(search => {
      this._searchUsersWhoBookmarkedThis(search);
    });
  }

  protected scrollToComments(event: MouseEvent) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const _win = this.windowRefService.nativeWindow;
    const _doc = _win.document;
    const imageId = this.image.hash || this.image.pk;

    const adManagerElement: HTMLElement | null = _doc.querySelector(
      `#image-viewer-${imageId} .data-area astrobin-ad-manager`
    );

    const floatingTitleElement: HTMLElement | null = _doc.querySelector(
      `#image-viewer-${imageId} astrobin-image-viewer-floating-title`
    );

    let offsetHeight = 0;

    if (adManagerElement) {
      const computedStyle = _win.getComputedStyle(adManagerElement);
      if (computedStyle.position === "sticky" || computedStyle.position === "fixed") {
        offsetHeight += adManagerElement.offsetHeight;
      }
    }

    if (floatingTitleElement) {
      offsetHeight += floatingTitleElement.offsetHeight;
    }

    const commentsSection: HTMLElement | null = _doc.querySelector(
      `#image-viewer-${imageId} .image-viewer-comments-header`
    );
    const scrollArea: HTMLElement | null = this.imageViewerService.getScrollArea(this.image.hash || this.image.pk).scrollArea;

    if (commentsSection && scrollArea) {
      // Calculate the position of commentsSection relative to scrollArea
      const commentsRect = commentsSection.getBoundingClientRect();
      const scrollAreaRect = scrollArea.getBoundingClientRect();
      const offset = commentsRect.top - scrollAreaRect.top + scrollArea.scrollTop - offsetHeight - 10;

      scrollArea.scrollTo({
        top: offset,
        behavior: "smooth"
      });
    }
  }

  protected openLikeThisOffcanvas() {
    this.likeThisSearch = "";
    this.loadingService.setLoading(true);
    this._searchUsersWhoLikeThis(null).subscribe(() => {
      const offcanvas = this.offcanvasService.open(
        this.likeThisOffcanvas, {
          panelClass: "image-like-this-offcanvas",
          position: this.deviceService.offcanvasPosition()
        }
      );

      offcanvas.shown.pipe(take(1)).subscribe(() => {
        this.store$.dispatch(new ForceCheckTogglePropertyAutoLoad());
        this.loadingService.setLoading(false);
      });
    });
  }

  protected openBookmarkedThisOffcanvas() {
    this.bookmarkedThisSearch = "";
    this.loadingService.setLoading(true);
    this._searchUsersWhoBookmarkedThis(null).subscribe(() => {
      const offcanvas = this.offcanvasService.open(
        this.bookmarkedThisOffcanvas, {
          panelClass: "image-bookmarked-this-offcanvas",
          position: this.deviceService.offcanvasPosition()
        }
      );

      offcanvas.shown.pipe(take(1)).subscribe(() => {
        this.store$.dispatch(new ForceCheckTogglePropertyAutoLoad());
        this.loadingService.setLoading(false);
      });
    });
  }

  private _searchUsersWhoLikeThis(q: string): Observable<any> {
    this.searching = true;
    return this.imageApiService.getUsersWhoLikeImage(this.image.pk, q).pipe(tap(users => {
      this.likeThis = users;
      this.searching = false;
    }));
  }

  private _searchUsersWhoBookmarkedThis(q: string): Observable<any> {
    this.searching = true;
    return this.imageApiService.getUsersWhoBookmarkedImage(this.image.pk, q).pipe(tap(users => {
      this.bookmarkedThis = users;
      this.searching = false;
    }));
  }
}
