import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit, PLATFORM_ID, TemplateRef, ViewChild } from "@angular/core";
import { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { ImageService } from "@core/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@core/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@core/services/device.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { debounceTime, distinctUntilChanged, filter, map, take, takeUntil, tap } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { isPlatformBrowser } from "@angular/common";
import { UtilsService } from "@core/services/utils/utils.service";
import { finalize, fromEvent, Observable, Subject, throttleTime } from "rxjs";
import { ImageApiService, UsersWhoLikeOrBookmarkInterface } from "@core/services/api/classic/images/image/image-api.service";
import { ForceCheckTogglePropertyAutoLoad } from "@app/store/actions/image.actions";
import { LoadingService } from "@core/services/loading.service";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { CookieService } from "ngx-cookie";
import { CollapseSyncService } from "@core/services/collapse-sync.service";


@Component({
  selector: "astrobin-image-viewer-social-buttons",
  template: `
    <ng-template #likeButtonTemplate let-currentUserWrapper>
      <div *ngIf="showLike && !!image" class="like">
        <astrobin-toggle-property
          *ngIf="currentUserWrapper.user?.id !== image.user"
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
          *ngIf="!!currentUserWrapper.user && currentUserWrapper.user.id === image.user"
          (click)="openLikeThisOffcanvas()"
          class="like-count me-3"
        >
          <fa-icon icon="thumbs-up"></fa-icon>
          <span class="ms-2">{{ image.likeCount }}</span>
        </div>
      </div>
    </ng-template>

    <ng-template #bookmarkButtonTemplate let-currentUserWrapper>
      <div *ngIf="showBookmark" class="bookmark">
        <astrobin-toggle-property
          *ngIf="!!image && currentUserWrapper.user?.id !== image.user"
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
    </ng-template>

    <ng-template #commentsButtonTemplate>
      <div *ngIf="image?.allowComments && showComments" class="comment me-2">
        <button
          (click)="scrollToComments($event)"
          class="btn btn-link link-primary btn-no-block {{ btnExtraClasses }}"
        >
          <fa-icon
            [ngbTooltip]="'Comments' | translate"
            triggers="hover click"
            container="body"
            icon="comments"
          ></fa-icon>

          <span class="count ms-2">
            <astrobin-nested-comments-count
              [contentType]="imageContentType"
              [objectId]="image?.pk"
            ></astrobin-nested-comments-count>
          </span>
        </button>
      </div>
    </ng-template>

    <ng-template #shareButtonTemplate>
      <div *ngIf="showShare" class="share px-2">
        <astrobin-image-viewer-share-button
          [image]="image"
          [revisionLabel]="revisionLabel"
        ></astrobin-image-viewer-share-button>
      </div>
    </ng-template>

    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="buttons d-flex gap-2 align-items-center">
        <ng-container *ngIf="imageContentType && currentUserWrapper$ | async as currentUserWrapper">
          <ng-container
            [ngTemplateOutlet]="likeButtonTemplate"
            [ngTemplateOutletContext]="{ $implicit: currentUserWrapper }"
          ></ng-container>
          <ng-container
            [ngTemplateOutlet]="bookmarkButtonTemplate"
            [ngTemplateOutletContext]="{ $implicit: currentUserWrapper }"></ng-container>
          <ng-container
            [ngTemplateOutlet]="commentsButtonTemplate"
          ></ng-container>
          <ng-container [ngTemplateOutlet]="shareButtonTemplate"
          ></ng-container>
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
            <table
              *ngIf="likeThis && likeThis.length > 0; else nothingHereTemplate"
              class="table table-sm table-striped"
            >
              <tbody>
              <tr *ngFor="let like of likeThis">
                <td>
                  <a [routerLink]="['/u', like.username]">
                    {{ like.displayName || like.username }}
                  </a>
                  <div class="d-xl-none">
                    {{ like.timestamp | localDate | timeago: true }}
                  </div>
                </td>
                <td class="d-none d-xl-table-cell">
                  {{ like.timestamp | localDate | timeago: true }}
                </td>
                <td class="text-end">
                  <astrobin-toggle-property
                    *ngIf="!!currentUserWrapper.user && currentUserWrapper.user.id !== like.userId"
                    [userId]="currentUserWrapper.user.id"
                    [contentType]="userContentType.id"
                    [objectId]="like.userId"
                    [propertyType]="'follow'"
                    [showLabel]="false"
                    [toggled]="like.followed"
                    class="d-block"
                    btnClass="btn btn-sm btn-link text-secondary"
                  ></astrobin-toggle-property>
                </td>
              </tr>
              </tbody>
            </table>

            <astrobin-loading-indicator *ngIf="loadingMore"></astrobin-loading-indicator>
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
            <table
              *ngIf="bookmarkedThis && bookmarkedThis.length > 0; else nothingHereTemplate"
              class="table table-sm table-striped"
            >
              <tbody>
              <tr *ngFor="let bookmark of bookmarkedThis">
                <td>
                  <a [routerLink]="['/u', bookmark.username]">
                    {{ bookmark.displayName || bookmark.username }}
                  </a>
                  <div class="d-xl-none">
                    {{ bookmark.timestamp | localDate | timeago: true }}
                  </div>
                </td>
                <td class="d-none d-xl-table-cell">
                  {{ bookmark.timestamp | localDate | timeago: true }}
                </td>
                <td class="text-end">
                  <astrobin-toggle-property
                    *ngIf="!!currentUserWrapper.user && currentUserWrapper.user.id !== bookmark.userId"
                    [userId]="currentUserWrapper.user.id"
                    [contentType]="userContentType.id"
                    [objectId]="bookmark.userId"
                    [propertyType]="'follow'"
                    [showLabel]="false"
                    [toggled]="bookmark.followed"
                    class="d-block"
                    btnClass="btn btn-sm btn-link text-secondary"
                  ></astrobin-toggle-property>
                </td>
              </tr>
              </tbody>
            </table>

            <astrobin-loading-indicator *ngIf="loadingMore"></astrobin-loading-indicator>
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
  styleUrls: ["./image-viewer-social-buttons.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  @Input() btnExtraClasses = "";

  @ViewChild("shareTemplate") shareTemplate: TemplateRef<any>;
  @ViewChild("likeThisOffcanvas") likeThisOffcanvas: TemplateRef<any>;
  @ViewChild("bookmarkedThisOffcanvas") bookmarkedThisOffcanvas: TemplateRef<any>;

  protected userContentType: ContentTypeInterface;
  protected imageContentType: ContentTypeInterface;
  protected searching = false;

  protected likeThis: UsersWhoLikeOrBookmarkInterface[] = [];
  protected likeThisSearch: string;
  protected likeThisSearchSubject = new Subject<string>();
  protected likeThisPage = 1;

  protected bookmarkedThis: UsersWhoLikeOrBookmarkInterface[];
  protected bookmarkedThisSearch: string;
  protected bookmarkedThisSearchSubject = new Subject<string>();
  protected bookmarkedThisPage = 1;

  protected loadingMore = false; // If loading more pages of likes/bookmarks
  protected hasMorePages = false; // If there are more pages of likes/bookmarks

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
    public readonly loadingService: LoadingService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly cookieService: CookieService,
    public readonly collapseSyncService: CollapseSyncService
  ) {
    super(
      store$,
      searchService,
      router,
      imageViewerService,
      windowRefService,
      cookieService,
      collapseSyncService,
      changeDetectorRef
    );

    this.store$.pipe(
      select(selectContentType, { appLabel: "astrobin", model: "image" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.imageContentType = contentType;
      this.changeDetectorRef.markForCheck();
    });

    this.store$.pipe(
      select(selectContentType, { appLabel: "auth", model: "user" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.userContentType = contentType;
      this.changeDetectorRef.markForCheck();
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
      this.changeDetectorRef.markForCheck();
    });

    this.bookmarkedThisSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(search => {
      this._searchUsersWhoBookmarkedThis(search);
      this.changeDetectorRef.markForCheck();
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
    this._openPropertyOffcanvas({
      searchProperty: "likeThisSearch",
      searchMethod: this._searchUsersWhoLikeThis.bind(this),
      offcanvasTemplate: this.likeThisOffcanvas,
      panelClass: "image-like-this-offcanvas"
    });
  }

  protected openBookmarkedThisOffcanvas() {
    this._openPropertyOffcanvas({
      searchProperty: "bookmarkedThisSearch",
      searchMethod: this._searchUsersWhoBookmarkedThis.bind(this),
      offcanvasTemplate: this.bookmarkedThisOffcanvas,
      panelClass: "image-bookmarked-this-offcanvas"
    });
  }

  private _openPropertyOffcanvas(
    params: {
      searchProperty: "likeThisSearch" | "bookmarkedThisSearch";
      searchMethod: (q: string | null) => Observable<any>;
      offcanvasTemplate: any;
      panelClass: string;
    }
  ) {
    this[params.searchProperty] = "";
    this.loadingService.setLoading(true);

    params.searchMethod(null).subscribe(() => {
      const offcanvas = this.offcanvasService.open(
        params.offcanvasTemplate, {
          panelClass: `image-viewer-offcanvas ${params.panelClass}`,
          backdropClass: "image-viewer-offcanvas-backdrop",
          position: this.deviceService.offcanvasPosition()
        }
      );

      offcanvas.shown.pipe(take(1)).subscribe(() => {
        this.store$.dispatch(new ForceCheckTogglePropertyAutoLoad());
        this.loadingService.setLoading(false);

        const offcanvasElement = document.querySelector(`.${params.panelClass} .offcanvas-body`);
        if (offcanvasElement) {
          // Check if content is shorter than viewport and we have more pages
          const checkAndLoadMore = () => {
            const element = offcanvasElement as HTMLElement;
            if (element.scrollHeight <= element.clientHeight && this.hasMorePages && !this.loadingMore) {
              this.loadingMore = true;
              params.searchMethod(this[params.searchProperty] as string)
                .pipe(finalize(() => this.loadingMore = false))
                .subscribe(() => {
                  // Recursively check again after loading, in case we still need more
                  this.utilsService.delay(1).subscribe(() => checkAndLoadMore());
                });
              this.changeDetectorRef.markForCheck();
            }
          };

          // Initial check when offcanvas opens
          checkAndLoadMore();

          // Set up scroll listener for further loading
          fromEvent(offcanvasElement, "scroll")
            .pipe(
              takeUntil(offcanvas.hidden),
              throttleTime(200),
              map((event: Event) => {
                const element = event.target as HTMLElement;
                const threshold = 400;
                return element.scrollHeight - (element.scrollTop + element.clientHeight) <= threshold;
              }),
              filter(isNearBottom => isNearBottom),
              filter(() => !this.loadingMore && this.hasMorePages)
            ).subscribe(() => {
            this.loadingMore = true;
            params.searchMethod(this[params.searchProperty] as string)
              .pipe(finalize(() => this.loadingMore = false))
              .subscribe();
            this.changeDetectorRef.markForCheck();
          });
        }
      });
    });
  }

  private _searchUsersWithProperty(params: {
    propertyType: "like" | "bookmark";
    query: string;
    pageProperty: "likeThisPage" | "bookmarkedThisPage";
    resultsProperty: "likeThis" | "bookmarkedThis";
    searchMethod: (pk: number, q: string, page: number) => Observable<PaginatedApiResultInterface<UsersWhoLikeOrBookmarkInterface>>;
  }): Observable<PaginatedApiResultInterface<UsersWhoLikeOrBookmarkInterface>> {
    if (!!params.query) {
      // Reset page and results when performing a new search
      this[params.pageProperty] = 1;
      this[params.resultsProperty] = [];
    }

    if (this[params.pageProperty] === 1) {
      this.searching = true;
      this[params.resultsProperty] = [];
    } else {
      this.loadingMore = true;
    }

    return params.searchMethod(this.image.pk, params.query, this[params.pageProperty]).pipe(
      tap(response => {
        this[params.resultsProperty] = [
          ...(this[params.resultsProperty] || []),
          ...response.results
        ];

        this.searching = false;
        this.loadingMore = false;
        this.hasMorePages = !!response.next;

        // Increment page number after successful load
        if (this.hasMorePages) {
          this[params.pageProperty]++;
        }

        this.changeDetectorRef.markForCheck();
      })
    );
  }

  private _searchUsersWhoLikeThis(q: string): Observable<PaginatedApiResultInterface<UsersWhoLikeOrBookmarkInterface>> {
    return this._searchUsersWithProperty({
      propertyType: "like",
      query: q,
      pageProperty: "likeThisPage",
      resultsProperty: "likeThis",
      searchMethod: this.imageApiService.getUsersWhoLikeImage.bind(this.imageApiService)
    });
  }

  private _searchUsersWhoBookmarkedThis(q: string): Observable<PaginatedApiResultInterface<UsersWhoLikeOrBookmarkInterface>> {
    return this._searchUsersWithProperty({
      propertyType: "bookmark",
      query: q,
      pageProperty: "bookmarkedThisPage",
      resultsProperty: "bookmarkedThis",
      searchMethod: this.imageApiService.getUsersWhoBookmarkedImage.bind(this.imageApiService)
    });
  }
}
