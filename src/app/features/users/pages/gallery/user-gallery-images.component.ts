import { ChangeDetectorRef, Component, ElementRef, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges, ViewContainerRef } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { FindImages, FindImagesSuccess } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { filter, map, startWith, take, takeUntil } from "rxjs/operators";
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
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { selectCollectionsByParams } from "@app/store/selectors/app/collection.selectors";
import { LoadCollections } from "@app/store/actions/collection.actions";
import { ImageViewerSlideshowComponent } from "@shared/components/misc/image-viewer-slideshow/image-viewer-slideshow.component";

@Component({
  selector: "astrobin-user-gallery-images",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <astrobin-nothing-here
        *ngIf="!loading && images.length === 0"
        [withAlert]="false"
        [withInfoSign]="false"
      ></astrobin-nothing-here>

      <astrobin-user-gallery-loading
        *ngIf="loading && loadingPlaceholdersCount && loadingPlaceholdersCount > 10"
        @fadeInOut
        [activeLayout]="activeLayout"
        [numberOfImages]="loadingPlaceholdersCount"
      ></astrobin-user-gallery-loading>

      <astrobin-loading-indicator
        *ngIf="loading && (!loadingPlaceholdersCount || loadingPlaceholdersCount <= 10)"
        @fadeInOut
      ></astrobin-loading-indicator>

      <p
        *ngIf="options.q"
        class="alert alert-dark"
      >
        <fa-icon icon="info-circle"></fa-icon>
        {{ "You can refine your search by using the advanced search page and filtering by user." | translate }}
      </p>

      <ng-container *ngTemplateOutlet="acquisitionSortingInfoTemplate"></ng-container>

      <div
        *ngIf="
          !loading &&
          images.length > 0 &&
          (
            activeLayout === UserGalleryActiveLayout.SMALL ||
            activeLayout === UserGalleryActiveLayout.LARGE
          )
        "
        @fadeInOut
        (gridItemsChange)="onGridItemsChange($event)"
        [astrobinMasonryLayout]="images"
        [activeLayout]="activeLayout"
        class="masonry-layout-container"
        [class.layout-tiny]="activeLayout === UserGalleryActiveLayout.TINY"
        [class.layout-small]="activeLayout === UserGalleryActiveLayout.SMALL"
        [class.layout-large]="activeLayout === UserGalleryActiveLayout.LARGE"
      >
        <ng-container *ngIf="gridItems?.length > 0">
          <a
            *ngFor="let item of gridItems"
            (click)="openImage(item)"
            [style.width.px]="item.displayWidth * averageHeight / item.displayHeight * .5"
            [style.flex-grow]="item.displayWidth * averageHeight / item.displayHeight * .5"
            [style.min-width.px]="averageHeight"
            [style.min-height.px]="averageHeight"
            [href]="'/i/' + (item.hash || item.pk)"
            astrobinEventPreventDefault
            [class.wip]="item.isWip"
            class="image-link"
          >
            <!-- ImageSerializerGallery always only has the regular thumbnail and no more -->
            <img
              *ngIf="item?.thumbnails?.length"
              [alt]="item.title"
              [ngSrc]="item.thumbnails[0].url"
              [style.object-position]="item.objectPosition"
              fill
            />

            <astrobin-image-icons [image]="item"></astrobin-image-icons>
            <astrobin-image-hover [image]="item" [showAuthor]="false"></astrobin-image-hover>

            <ng-container *ngTemplateOutlet="menuTemplate; context: { image: item }"></ng-container>
            <ng-container *ngTemplateOutlet="keyValueTagTemplate; context: { image: item }"></ng-container>
          </a>
        </ng-container>
      </div>

      <div
        *ngIf="!loading && images.length > 0 && activeLayout === UserGalleryActiveLayout.TINY"
        @fadeInOut
        class="masonry-layout-container layout-tiny"
      >
        <a
          *ngFor="let image of images"
          (click)="openImage(image)"
          [class.wip]="image.isWip"
          [href]="'/i/' + (image.hash || image.pk.toString())"
          astrobinEventPreventDefault
          class="image-link"
        >
          <img
            [ngSrc]="imageService.getGalleryThumbnail(image)"
            [alt]="image.title"
            [title]="image.title"
            [width]="130"
            [height]="130"
          />

          <astrobin-image-icons [image]="image"></astrobin-image-icons>
          <astrobin-image-hover [image]="image" [showAuthor]="false"></astrobin-image-hover>

          <ng-container *ngTemplateOutlet="menuTemplate; context: { image }"></ng-container>
          <ng-container *ngTemplateOutlet="keyValueTagTemplate; context: { image }"></ng-container>
        </a>
      </div>

      <div
        *ngIf="!loading && images.length > 0 && activeLayout === UserGalleryActiveLayout.TABLE"
        @fadeInOut
        class="table-layout-container"
      >
        <table class="table table-striped table-mobile-support">
          <thead>
          <tr>
            <th>{{ "Title" | translate }}</th>
            <th>{{ "Published" | translate }}</th>
            <th>{{ "Views" | translate }}</th>
            <th>{{ "Likes" | translate }}</th>
            <th>{{ "Bookmarks" | translate }}</th>
            <th>{{ "Comments" | translate }}</th>
          </thead>
          <tbody>
          <tr
            *ngFor="let image of images"
            [class.wip]="image.isWip"
          >
            <td [attr.data-label]="'Title' | translate" class="d-flex justify-content-md-between align-items-center">
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
export class UserGalleryImagesComponent extends BaseComponentDirective implements OnInit, OnChanges {
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
  protected gridItems: MasonryLayoutGridItem[] = [];
  protected averageHeight = 200;
  protected loadingPlaceholdersCount: number;

  private _findImagesSubscription: Subscription;
  private _slideshowComponent: ImageViewerSlideshowComponent;
  private _nearEndOfContextSubscription: Subscription;

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
        if (this._slideshowComponent) {
          this._slideshowComponent.setNavigationContext(this.images.map(image => ({
            imageId: image.hash || image.pk.toString(),
            thumbnailUrl: this.imageService.getGalleryThumbnail(image)
          })));
        }
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
      this.page = 1;
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
  }

  onGridItemsChange(event: { gridItems: any[]; averageHeight: number }): void {
    this.gridItems = event.gridItems;
    this.averageHeight = event.averageHeight;
    this.changeDetectorRef.detectChanges();
  }

  openImage(item: MasonryLayoutGridItem): void {
    const image = item as ImageInterface;
    const imageId = image.hash || image.pk.toString();
    const navigationContext = this.images.map(image => ({
      imageId: image.hash || image.pk.toString(),
      thumbnailUrl: this.imageService.getGalleryThumbnail(image)
    }));

    const slideshow = this.imageViewerService.openSlideshow(
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

  protected onImageRemovedFromCollection(event: { imageId: ImageInterface["pk"]; collectionId: CollectionInterface["id"] }): void {
    if (event.collectionId !== this.options.collection) {
      return;
    }

    this.images = this.images.filter(image => image.pk !== event.imageId);
    this.changeDetectorRef.detectChanges();
  }

  private _updateAverageHeight(layout: UserGalleryActiveLayout): void {
    if (layout === UserGalleryActiveLayout.LARGE) {
      this.averageHeight = 300;
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

  private _onScroll(){
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
