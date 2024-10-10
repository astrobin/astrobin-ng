import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges, ViewContainerRef } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { FindImages, FindImagesSuccess } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { filter, map, startWith, takeUntil } from "rxjs/operators";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { MasonryLayoutGridItem } from "@shared/directives/masonry-layout.directive";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { LoadingService } from "@shared/services/loading.service";
import { ImageService } from "@shared/services/image/image.service";
import { NavigationEnd, Router } from "@angular/router";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { fromEvent, merge, Subscription, throttleTime } from "rxjs";
import { FindImagesOptionsInterface } from "@shared/services/api/classic/images/image/image-api.service";
import { NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";
import { fadeInOut } from "@shared/animations";

@Component({
  selector: "astrobin-user-gallery-images",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <astrobin-nothing-here
        *ngIf="!loading && images.length === 0 && !options?.collection"
        [withAlert]="false"
        [withInfoSign]="false"
      ></astrobin-nothing-here>

      <astrobin-user-gallery-loading
        *ngIf="loading && loadingPlaceholdersCount && loadingPlaceholdersCount > 10"
        @fadeInOut
        [numberOfImages]="loadingPlaceholdersCount"
      ></astrobin-user-gallery-loading>

      <astrobin-loading-indicator
        *ngIf="loading && (!loadingPlaceholdersCount || loadingPlaceholdersCount <= 10)"
        @fadeInOut
      ></astrobin-loading-indicator>

      <div
        *ngIf="!loading && images.length > 0"
        @fadeInOut
        (gridItemsChange)="onGridItemsChange($event)"
        [astrobinMasonryLayout]="images"
        [alias]="ImageAlias.REGULAR"
        class="masonry-layout-container"

      >
        <ng-container *ngIf="gridItems?.length > 0">
          <a
            *ngFor="let item of gridItems"
            (click)="openImage(item)"
            [style.width.px]="item.displayWidth * averageHeight / item.displayHeight * .5"
            [style.flex-grow]="item.displayWidth * averageHeight / item.displayHeight * .5"
            [style.min-width.px]="averageHeight"
            [style.min-height.px]="averageHeight"
            [href]="'/i/' + (item.hash || item.id)"
            astrobinEventPreventDefault
            [class.wip]="item.isWip"
          >
            <!-- ImageSerializerGallery always only has the regular thumbnail and no more -->
            <img
              [alt]="item.title"
              [ngSrc]="item.thumbnails[0].url"
              [style.object-position]="item.objectPosition"
              fill
            />

            <fa-icon *ngIf="item.video || item.animated" icon="play"></fa-icon>

            <div class="badges">
              <fa-icon *ngIf="item.isIotd" class="iotd" icon="trophy"></fa-icon>
              <fa-icon *ngIf="item.isTopPick" class="top-pick" icon="star"></fa-icon>
              <fa-icon *ngIf="item.isTopPickNomination" class="top-pick-nomination" icon="arrow-up"></fa-icon>
            </div>

            <div *ngIf="averageHeight >= 150" class="hover d-flex align-items-center gap-2">
              <div class="flex-grow-1">
                <div class="title">{{ item.title }}</div>
                <div *ngIf="item.published" class="published">{{ item.published | localDate | timeago }}</div>
                <div *ngIf="!item.published && item.uploaded"
                     class="uploaded">{{ item.uploaded | localDate | timeago }}
                </div>
              </div>

              <div class="counters d-flex flex-column gap-1">
                <div class="counter likes">
                  <fa-icon icon="thumbs-up"></fa-icon>
                  <span class="value">{{ item.likeCount }}</span>
                </div>
                <div class="counter bookmarks">
                  <fa-icon icon="bookmark"></fa-icon>
                  <span class="value">{{ item.bookmarkCount }}</span>
                </div>
                <div class="counter comments">
                  <fa-icon icon="comment"></fa-icon>
                  <span class="value">{{ item.commentCount }}</span>
                </div>
              </div>
            </div>

            <fa-icon
              *ngIf="item.isWip"
              [ngbTooltip]="'This image is in your staging area' | translate"
              container="body"
              triggers="hover click"
              icon="lock"
              class="wip-icon"
            ></fa-icon>
          </a>
        </ng-container>
      </div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-images.component.scss"],
  animations: [fadeInOut]
})
export class UserGalleryImagesComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() options: FindImagesOptionsInterface;
  @Input() expectedImageCount: number;
  @Input() activeLayout: UserGalleryActiveLayout;

  protected readonly ImageAlias = ImageAlias;

  protected next: string | null = null;
  protected page = 1;
  protected images: ImageInterface[] = [];
  protected loading = false;
  protected loadingMore = false;
  protected gridItems: MasonryLayoutGridItem[] = [];
  protected averageHeight = 200;
  protected loadingPlaceholdersCount: number;

  private _findImagesSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly imageViewerService: ImageViewerService,
    public readonly viewContainerRef: ViewContainerRef,
    public readonly loadingService: LoadingService,
    public readonly imageService: ImageService,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly utilsService: UtilsService,
    public readonly paginationConfig: NgbPaginationConfig,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(null),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.page = 1;
      this.next = null;

      if (this._findImagesSubscription) {
        this._findImagesSubscription.unsubscribe();
      }

      actions$.pipe(
        ofType(AppActionTypes.FIND_IMAGES_SUCCESS),
        map((action: FindImagesSuccess) => action.payload),
        filter(payload => JSON.stringify(payload.options) === JSON.stringify({
          userId: this.user.id,
          gallerySerializer: true,
          page: this.page,
          ...this.options
        })),
        takeUntil(
          merge(
            this.destroyed$,
            this.router.events.pipe(filter(event => event instanceof NavigationEnd))
          )
        ),
        map(payload => payload.response)
      ).subscribe(response => {
        if (this.page > 1) {
          this.images = [...this.images, ...response.results];
        } else {
          this.images = response.results;
        }
        this.next = response.next;
        this.loadingMore = false;
        this.loading = false;
        this.changeDetectorRef.detectChanges();
      });
    });
  }

  ngOnInit() {
    super.ngOnInit();

    if (isPlatformBrowser(this.platformId)) {
      fromEvent(this.windowRefService.nativeWindow, "scroll")
        .pipe(takeUntil(this.destroyed$), throttleTime(200))
        .subscribe(() => this._onScroll());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user && changes.user.currentValue || changes.options) {
      this._getImages();
    }

    if (
      (changes.userProfile && changes.userProfile.currentValue) ||
      (changes.expectedImageCount && changes.expectedImageCount.currentValue)
    ) {
      if (this.expectedImageCount === 0) {
        this.loadingPlaceholdersCount = 0;
      } else {
        this.loadingPlaceholdersCount = Math.min(
          this.expectedImageCount || Number.MAX_SAFE_INTEGER,
          this.userProfile?.imageCount || Number.MAX_SAFE_INTEGER,
          this.paginationConfig.pageSize
        );
      }
    }

    if (changes.activeLayout) {
      this._updateAverageHeight(this.activeLayout);
    }
  }

  onGridItemsChange(event: { gridItems: any[]; averageHeight: number }): void {
    this.gridItems = event.gridItems;
    this.averageHeight = event.averageHeight;
    this.changeDetectorRef.detectChanges();
  }

  openImage(item: MasonryLayoutGridItem): void {
    const image = item as ImageInterface;
    const imageId = image.hash || image.pk;
    const navigationContext = this.images.map(image => ({
      imageId: image.hash || image.pk,
      thumbnailUrl: image.finalGalleryThumbnail
    }));

    const slideshow = this.imageViewerService.openSlideshow(
      this.componentId,
      imageId,
      FINAL_REVISION_LABEL,
      navigationContext,
      this.viewContainerRef,
      true
    );
  }

  private _updateAverageHeight(layout: UserGalleryActiveLayout): void {
    if (layout === UserGalleryActiveLayout.LARGE) {
      this.averageHeight = 500;
    } else {
      this.averageHeight = 200;
    }
  }

  private _getImages(): void {
    if (this.page > 1) {
      this.loadingMore = true;
    } else {
      this.loading = true;
    }

    this.store$.dispatch(new FindImages({
      options: {
        userId: this.user.id,
        gallerySerializer: true,
        page: this.page,
        ...this.options
      }
    }));
  }

  private _onScroll() {
    if (
      isPlatformServer(this.platformId) ||
      this.loading ||
      this.loadingMore ||
      this.next === null
    ) {
      return;
    }

    if (this.utilsService.isNearBottom(this.windowRefService, this.elementRef)) {
      this.page++;
      this._getImages();
    }
  }
}
