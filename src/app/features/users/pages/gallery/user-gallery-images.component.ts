import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnChanges, OnDestroy, OnInit, PLATFORM_ID, SimpleChanges, ViewContainerRef } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { FindImages, FindImagesSuccess } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { debounceTime, filter, map, take, takeUntil } from "rxjs/operators";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { LoadingService } from "@shared/services/loading.service";
import { ImageService } from "@shared/services/image/image.service";
import { NavigationEnd, Router } from "@angular/router";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { auditTime, fromEvent, merge, Subscription, throttleTime } from "rxjs";
import { FindImagesOptionsInterface } from "@shared/services/api/classic/images/image/image-api.service";
import { NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";
import { fadeInOut } from "@shared/animations";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { selectCollectionsByParams } from "@app/store/selectors/app/collection.selectors";
import { LoadCollections } from "@app/store/actions/collection.actions";
import { ImageViewerSlideshowComponent } from "@shared/components/misc/image-viewer-slideshow/image-viewer-slideshow.component";
import { MasonryBreakpoints } from "@shared/components/masonry-layout/masonry-layout.component";

@Component({
  selector: "astrobin-user-gallery-images",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <ng-container *ngIf="uiReady">
        <astrobin-nothing-here
          *ngIf="!loading && images.length === 0"
          [withAlert]="false"
          [withInfoSign]="false"
        ></astrobin-nothing-here>

        <p
          *ngIf="options.q"
          class="alert alert-dark"
        >
          <fa-icon icon="info-circle"></fa-icon>
          {{ "You can refine your search by using the advanced search page and filtering by user." | translate }}
        </p>

        <ng-container *ngTemplateOutlet="acquisitionSortingInfoTemplate"></ng-container>

        <astrobin-loading-indicator
          *ngIf="!loadingPlaceholdersCount || loadingPlaceholdersCount <= 10"
          [hidden]="!loading || masonryLayoutReady"
          @fadeInOut
        ></astrobin-loading-indicator>

        <astrobin-user-gallery-loading
          *ngIf="loadingPlaceholdersCount && loadingPlaceholdersCount > 10"
          [hidden]="!loading || masonryLayoutReady"
          @fadeInOut
          [activeLayout]="activeLayout"
          [numberOfImages]="loadingPlaceholdersCount"
        ></astrobin-user-gallery-loading>

        <ng-container *ngIf="!loading && images.length > 0 && activeLayout !== UserGalleryActiveLayout.TABLE">
          <astrobin-masonry-layout
            (layoutReady)="masonryLayoutReady = $event"
            [items]="images"
            [idProperty]="'pk'"
            [breakpoints]="breakpoints"
            [gutter]="gutter"
          >
            <ng-template let-item>
              <div class="image-container">
                <a
                  (click)="openImage(item)"
                  [href]="'/i/' + (item.hash || item.pk)"
                  [class.wip]="item.isWip"
                  class="image-link"
                  astrobinEventPreventDefault
                >
                  <img
                    [src]="imageService.getThumbnail(
                    item,
                    activeLayout === UserGalleryActiveLayout.TINY ? ImageAlias.GALLERY : ImageAlias.REGULAR
                  )"
                    [alt]="item.title"
                  />

                  <astrobin-image-icons [image]="item"></astrobin-image-icons>

                  <astrobin-image-hover
                    [image]="item"
                    [staticOverlay]="options.ordering"
                    [activeLayout]="activeLayout"
                    [showAuthor]="false"
                  ></astrobin-image-hover>

                  <ng-container *ngTemplateOutlet="menuTemplate; context: { image: item }"></ng-container>
                  <ng-container *ngTemplateOutlet="keyValueTagTemplate; context: { image: item }"></ng-container>
                </a>
              </div>
            </ng-template>
          </astrobin-masonry-layout>
        </ng-container>

        <ng-container
          *ngIf="!loading && images.length > 0 && activeLayout === UserGalleryActiveLayout.TABLE"
        >
          <div
            @fadeInOut
            class="table-layout-container"
          >
            <table class="table table-striped table-mobile-support">
              <thead>
              <tr>
                <th>
                  {{ "Title" | translate }}
                  <fa-icon *ngIf="options.subsection === 'title'" icon="sort-alpha-asc" class="ms-2"></fa-icon>
                </th>
                <th>
                  {{ "Published" | translate }}
                  <fa-icon *ngIf="options.subsection === 'uploaded'" icon="sort-desc" class="ms-2"></fa-icon>
                </th>
                <th>
                  {{ "Views" | translate }}
                </th>
                <th>
                  {{ "Likes" | translate }}
                  <fa-icon *ngIf="options.ordering === 'likes'" icon="sort-amount-down" class="ms-2"></fa-icon>
                </th>
                <th>
                  {{ "Bookmarks" | translate }}
                  <fa-icon *ngIf="options.ordering === 'bookmarks'" icon="sort-amount-down" class="ms-2"></fa-icon>
                </th>
                <th>
                  {{ "Comments" | translate }}
                  <fa-icon *ngIf="options.ordering === 'comments'" icon="sort-amount-down" class="ms-2"></fa-icon>
                </th>
              </thead>
              <tbody>
              <tr
                *ngFor="let image of images"
                [class.wip]="image.isWip"
              >
                <td [attr.data-label]="'Title' | translate"
                    class="d-flex justify-content-md-between align-items-center">
                  <a
                    (click)="openImage(image)"
                    [href]="'/i/' + (image.hash || image.pk.toString())"
                    astrobinEventPreventDefault
                  >
                    {{ image.title }}
                    <fa-icon *ngIf="image.isWip" class="ms-2" icon="lock"></fa-icon>
                  </a>
                  <ng-container *ngTemplateOutlet="menuTemplate; context: { image }"></ng-container>
                </td>
                <td [attr.data-label]="'Published' | translate" class="no-wrap">
                  <abbr [attr.title]="(image.published || image.uploaded) | localDate">
                    {{ (image.published || image.uploaded) | localDate | timeago: true }}
                  </abbr>
                </td>
                <td [attr.data-label]="'Views' | translate">{{ image.viewCount }}</td>
                <td [attr.data-label]="'Likes' | translate">{{ image.likeCount }}</td>
                <td [attr.data-label]="'Bookmarks' | translate">{{ image.bookmarkCount }}</td>
                <td [attr.data-label]="'Comments' | translate">{{ image.commentCount }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </ng-container>
      </ng-container>
    </ng-container>

    <div *ngIf="loadingMore && !loading" class="loading">
      <ng-container [ngTemplateOutlet]="loadingTemplate"></ng-container>
    </div>

    <ng-template #menuTemplate let-image="image">
      <astrobin-user-gallery-image-menu
        (imageDeleted)="onImageDeleted($event)"
        (imageRemovedFromCollection)="onImageRemovedFromCollection($event)"
        [user]="user"
        [userProfile]="userProfile"
        [image]="image"
      ></astrobin-user-gallery-image-menu>
    </ng-template>

    <ng-template #keyValueTagTemplate let-image="image">
      <div class="key-value-tag" *ngIf="collection?.orderByTag && image.keyValueTags">
        <span *ngFor="let tag of image.keyValueTags.split(',')">
          <ng-container *ngIf="tag.split('=')[0] === collection.orderByTag">
            {{ tag }}
          </ng-container>
        </span>
      </div>
    </ng-template>

    <ng-template #acquisitionSortingInfoTemplate>
      <p *ngIf="options?.subsection === 'acquired'" class="alert alert-mini alert-info mb-4">
        This gallery is sorted by acquisition date. Any images without an acquisition date are not shown here.
      </p>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-images.component.scss"],
  animations: [fadeInOut]
})
export class UserGalleryImagesComponent extends BaseComponentDirective implements OnInit, OnChanges, OnDestroy {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() options: FindImagesOptionsInterface;
  @Input() expectedImageCount: number;
  @Input() activeLayout: UserGalleryActiveLayout;

  protected readonly ImageAlias = ImageAlias;
  protected readonly UserGalleryActiveLayout = UserGalleryActiveLayout;

  protected collection: CollectionInterface;
  protected next: string | null = null;
  protected page = 1;
  protected images: ImageInterface[] = [];
  protected loading = false;
  protected loadingMore = false;
  protected loadingPlaceholdersCount: number;
  protected breakpoints: MasonryBreakpoints;
  protected gutter: number;
  protected masonryLayoutReady = false;
  protected uiReady = false;

  private readonly _isBrowser: boolean;

  private _findImagesSubscription: Subscription;
  private _slideshowComponent: ImageViewerSlideshowComponent;
  private _nearEndOfContextSubscription: Subscription;
  private _containerWidth = 0;

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

    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    super.ngOnInit();

    if (this._isBrowser) {
      const scrollElement = UtilsService.getScrollableParent(this.elementRef.nativeElement, this.windowRefService);

      fromEvent(scrollElement, "scroll")
        .pipe(takeUntil(this.destroyed$), throttleTime(200), debounceTime(100))
        .subscribe(() => this._onScroll());

      fromEvent(this.windowRefService.nativeWindow, "resize")
        .pipe(takeUntil(this.destroyed$), auditTime(200))
        .subscribe(() => this._checkUiReady());

      this._checkUiReady();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes.user && changes.user.currentValue) ||
      (changes.options && JSON.stringify(changes.options.currentValue) !== JSON.stringify(changes.options.previousValue))
    ) {
      this.page = 1;
      this.loadingPlaceholdersCount = 0;
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
      this._calculateBreakpointsAndGutter();
      this.masonryLayoutReady = false;
    }

    if (changes.options && changes.options.currentValue.collection) {
      this.store$.pipe(
        select(selectCollectionsByParams({ ids: [changes.options.currentValue.collection] })),
        filter(collections => collections?.length > 0),
        map(collections => collections[0]),
        take(1),
        takeUntil(this.destroyed$)
      ).subscribe(collection => {
        this.collection = collection;
      });

      this.store$.dispatch(new LoadCollections({ params: { ids: [changes.options.currentValue.collection] } }));
    }

    if (this._findImagesSubscription) {
      this._findImagesSubscription.unsubscribe();
    }

    this._findImagesSubscription = this.actions$.pipe(
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
      if (this._slideshowComponent) {
        this._slideshowComponent.setNavigationContext(this.images.map(image => ({
          imageId: image.hash || image.pk.toString(),
          thumbnailUrl: this.imageService.getGalleryThumbnail(image)
        })));
      }
    });
  }

  ngOnDestroy() {
    if (this._findImagesSubscription) {
      this._findImagesSubscription.unsubscribe();
      this._findImagesSubscription = null;
    }
  }

  openImage(image: ImageInterface): void {
    const imageId = image.hash || image.pk.toString();
    const navigationContext = this.images.map(image => ({
      imageId: image.hash || image.pk.toString(),
      thumbnailUrl: this.imageService.getGalleryThumbnail(image)
    }));

    this.imageViewerService.openSlideshow(
      this.componentId,
      imageId,
      FINAL_REVISION_LABEL,
      navigationContext,
      this.viewContainerRef,
      true
    ).subscribe(slideshow => {
      this._slideshowComponent = slideshow.instance;

      if (this._nearEndOfContextSubscription) {
        this._nearEndOfContextSubscription.unsubscribe();
      }

      this._nearEndOfContextSubscription = slideshow.instance.nearEndOfContext
        .pipe(
          filter(callerComponentId => callerComponentId === this.componentId)
        )
        .subscribe(() => {
          if (
            this.loading ||
            this.loadingMore ||
            this.next === null
          ) {
            return;
          }

          this.page++;
          this._getImages();
        });
    });
  }

  protected onImageDeleted(imageId: ImageInterface["pk"]): void {
    this.images = this.images.filter(image => image.pk !== imageId);
    this.changeDetectorRef.detectChanges();
  }

  protected onImageRemovedFromCollection(event: {
    imageId: ImageInterface["pk"];
    collectionId: CollectionInterface["id"]
  }): void {
    if (event.collectionId !== this.options.collection) {
      return;
    }

    this.images = this.images.filter(image => image.pk !== event.imageId);
    this.changeDetectorRef.detectChanges();
  }

  private _checkUiReady(): void {
    if (!this._isBrowser) {
      return;
    }
    this._containerWidth = this.elementRef.nativeElement?.parentElement?.clientWidth;

    if (this._containerWidth > 0) {
      this._calculateBreakpointsAndGutter();
      this.uiReady = true;
    } else {
      this.utilsService.delay(100).subscribe(() => this._checkUiReady());
    }
  }

  private _calculateBreakpointsAndGutter(): void {
    const { breakpoints, gutter } = this.imageService.getBreakpointsAndGutterForMasonryLayout(
      this._containerWidth,
      this.activeLayout
    );

    if (
      this.breakpoints === undefined ||
      this.gutter === undefined ||
      JSON.stringify(this.breakpoints) !== JSON.stringify(breakpoints) ||
      this.gutter !== gutter
    ) {
      this.breakpoints = breakpoints;
      this.gutter = gutter;
    }
  }

  private _getImages(): void {
    if (this.page > 1) {
      this.loadingMore = true;
    } else {
      this.loading = true;
      this.masonryLayoutReady = false;
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
      !this.masonryLayoutReady ||
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
