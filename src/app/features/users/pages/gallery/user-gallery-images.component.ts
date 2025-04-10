import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import {
  ChangeDetectorRef,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  PLATFORM_ID
} from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { LoadCollections } from "@app/store/actions/collection.actions";
import { FindImagesSuccess, FindImages } from "@app/store/actions/image.actions";
import { selectCollectionsByParams } from "@app/store/selectors/app/collection.selectors";
import { MainState } from "@app/store/state";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { ImageGalleryLayout } from "@core/enums/image-gallery-layout.enum";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { ImageInterface, FINAL_REVISION_LABEL } from "@core/interfaces/image.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { FindImagesOptionsInterface } from "@core/services/api/classic/images/image/image-api.service";
import { DeviceService } from "@core/services/device.service";
import { ImageService } from "@core/services/image/image.service";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";
import { Actions, ofType } from "@ngrx/effects";
import { Store, select } from "@ngrx/store";
import { fadeInOut } from "@shared/animations";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageViewerSlideshowComponent } from "@shared/components/misc/image-viewer-slideshow/image-viewer-slideshow.component";
import { Subscription, finalize, fromEvent, merge, throttleTime } from "rxjs";
import { debounceTime, filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-user-gallery-images",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <ng-container *ngIf="!!activeLayout; else loadingTemplate">
        <div *ngIf="!loading && images.length === 0">
          <astrobin-nothing-here
            [withAlert]="false"
            [withInfoSign]="false"
            class="d-inline-block"
          ></astrobin-nothing-here>

          <a *ngIf="currentUserWrapper.user?.id === user.id" [routerLink]="['/uploader']">
            {{ "Upload an image or a video now!" | translate }}
          </a>
        </div>

        <p *ngIf="options.q" class="alert alert-dark">
          <fa-icon icon="info-circle"></fa-icon>
          {{ "You can refine your search by using the advanced search page and filtering by user." | translate }}
        </p>

        <ng-container *ngTemplateOutlet="acquisitionSortingInfoTemplate"></ng-container>

        <astrobin-loading-indicator
          *ngIf="!loadingPlaceholdersCount || loadingPlaceholdersCount <= 10"
          [hidden]="!loading"
        ></astrobin-loading-indicator>

        <astrobin-image-gallery-loading
          *ngIf="loadingPlaceholdersCount && loadingPlaceholdersCount > 10"
          [hidden]="!loading"
          [activeLayout]="activeLayout"
          [numberOfImages]="loadingPlaceholdersCount"
        ></astrobin-image-gallery-loading>

        <ng-container *ngIf="!loading && images.length > 0 && activeLayout !== UserGalleryActiveLayout.TABLE">
          <astrobin-masonry-layout
            [items]="images"
            [layout]="
              activeLayout === UserGalleryActiveLayout.SMALL
                ? 'small'
                : activeLayout === UserGalleryActiveLayout.MEDIUM
                ? 'medium'
                : 'large'
            "
            [idProperty]="'pk'"
            [leftAlignLastRow]="next === null"
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
                  <ng-container *ngIf="imageService.getObjectFit(item) as fit">
                    <div
                      [astrobinLazyBackground]="imageService.getThumbnail(item, ImageAlias.REGULAR)"
                      [highResolutionUrl]="imageService.getThumbnail(item, ImageAlias.HD)"
                      [useHighResolution]="fit.scale > 3 || activeLayout === ImageGalleryLayout.LARGE"
                      [ngStyle]="{
                        'background-position': fit.position.x + '% ' + fit.position.y + '%',
                        'background-size': fit.scale > 1.5 ? fit.scale * 100 + '%' : 'cover',
                        'background-repeat': 'no-repeat'
                      }"
                      [attr.aria-label]="item.title"
                      role="img"
                    ></div>
                  </ng-container>

                  <astrobin-loading-indicator
                    *ngIf="loadingImageId === item.pk"
                    @fadeInOut
                    class="position-absolute top-0"
                  ></astrobin-loading-indicator>

                  <astrobin-image-icons [image]="item"></astrobin-image-icons>

                  <astrobin-image-hover
                    *ngIf="!loadingImageId"
                    @fadeInOut
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

        <ng-container *ngIf="!loading && images.length > 0 && activeLayout === UserGalleryActiveLayout.TABLE">
          <div class="table-layout-container">
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
                    <fa-icon *ngIf="options.ordering === 'views'" icon="sort-amount-down" class="ms-2"></fa-icon>
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
                </tr>
              </thead>

              <tbody>
                <tr *ngFor="let image of images" [class.wip]="image.isWip">
                  <td
                    [attr.data-label]="'Title' | translate"
                    class="d-flex justify-content-md-between align-items-md-center flex-column flex-md-row"
                  >
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
                    <abbr [attr.title]="image.published || image.uploaded | localDate">
                      {{ image.published || image.uploaded | localDate | timeago  }}
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

    <div *ngIf="!loadingMore && !loading && !!next" class="w-100 d-flex justify-content-center mt-4">
      <button (click)="onScroll()" class="btn btn-outline-primary btn-no-block">
        {{ "Load more" | translate }}
      </button>
    </div>

    <div *ngIf="loadingMore && !loading" class="loading mt-4 mb-2 mb-md-0">
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
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryImagesComponent extends BaseComponentDirective implements OnInit, OnChanges, OnDestroy {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() options: FindImagesOptionsInterface;
  @Input() expectedImageCount: number;
  @Input() activeLayout: ImageGalleryLayout;

  @Output() imagesLoaded = new EventEmitter<ImageInterface[]>();

  protected readonly ImageAlias = ImageAlias;
  protected readonly UserGalleryActiveLayout = ImageGalleryLayout;

  protected collection: CollectionInterface;
  protected next: string | null = null;
  protected page = 1;
  protected images: ImageInterface[] = [];
  protected loading = false;
  protected loadingMore = false;
  protected loadingPlaceholdersCount: number;
  protected loadingImageId: ImageInterface["pk"];

  private readonly _isBrowser: boolean;

  private _findImagesSubscription: Subscription;
  private _slideshowComponent: ImageViewerSlideshowComponent;
  private _nearEndOfContextSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly imageViewerService: ImageViewerService,
    public readonly loadingService: LoadingService,
    public readonly imageService: ImageService,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly utilsService: UtilsService,
    public readonly paginationConfig: NgbPaginationConfig,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly deviceService: DeviceService
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
        .subscribe(() => {
          this.onScroll();
          this.changeDetectorRef.markForCheck();
        });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes.user && changes.user.currentValue) ||
      (changes.options &&
        JSON.stringify(changes.options.currentValue) !== JSON.stringify(changes.options.previousValue))
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

    if (changes.options && changes.options.currentValue.collection) {
      this.store$
        .pipe(
          select(selectCollectionsByParams({ ids: [changes.options.currentValue.collection] })),
          filter(collections => collections?.length > 0),
          map(collections => collections[0]),
          take(1),
          takeUntil(this.destroyed$)
        )
        .subscribe(collection => {
          this.collection = collection;
          this.changeDetectorRef.markForCheck();
        });

      this.store$.dispatch(new LoadCollections({ params: { ids: [changes.options.currentValue.collection] } }));
    }

    if (this._findImagesSubscription) {
      this._findImagesSubscription.unsubscribe();
    }

    this._findImagesSubscription = this.actions$
      .pipe(
        ofType(AppActionTypes.FIND_IMAGES_SUCCESS),
        map((action: FindImagesSuccess) => action.payload),
        filter(
          payload =>
            JSON.stringify(payload.options) ===
            JSON.stringify({
              userId: this.user.id,
              gallerySerializer: true,
              page: this.page,
              ...this.options
            })
        ),
        takeUntil(merge(this.destroyed$, this.router.events.pipe(filter(event => event instanceof NavigationEnd)))),
        map(payload => payload.response)
      )
      .subscribe(response => {
        if (this.page > 1) {
          this.images = [...this.images, ...response.results];
        } else {
          this.images = response.results;
        }

        this.next = response.next;
        this.loadingMore = false;
        this.loading = false;

        if (this._slideshowComponent) {
          this._slideshowComponent.setNavigationContext(
            this.images.map(image => ({
              imageId: image.hash || image.pk.toString(),
              thumbnailUrl: this.imageService.getGalleryThumbnail(image)
            }))
          );
        }

        this.imagesLoaded.emit(this.images);

        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnDestroy() {
    if (this._findImagesSubscription) {
      this._findImagesSubscription.unsubscribe();
      this._findImagesSubscription = null;
    }
  }

  openImage(image: ImageInterface): void {
    this.loadingImageId = image.pk;

    const imageId = image.hash || image.pk.toString();
    const navigationContext = this.images.map(image => ({
      imageId: image.hash || image.pk.toString(),
      thumbnailUrl: this.imageService.getGalleryThumbnail(image)
    }));

    this.imageService
      .loadImage(imageId)
      .pipe(
        switchMap(dbImage => {
          const alias: ImageAlias = this.deviceService.lgMax() ? ImageAlias.HD : ImageAlias.QHD;
          const thumbnailUrl = this.imageService.getThumbnail(dbImage, alias);
          return this.imageService.loadImageFile(thumbnailUrl, () => {});
        }),
        switchMap(() =>
          this.imageViewerService.openSlideshow(
            this.componentId,
            imageId,
            FINAL_REVISION_LABEL,
            navigationContext,
            true
          )
        ),
        tap(slideshow => {
          this._slideshowComponent = slideshow.instance;

          if (this._nearEndOfContextSubscription) {
            this._nearEndOfContextSubscription.unsubscribe();
          }

          this._nearEndOfContextSubscription = slideshow.instance.nearEndOfContext
            .pipe(
              filter(callerComponentId => callerComponentId === this.componentId),
              tap(() => {
                if (this.loading || this.loadingMore || this.next === null) {
                  return;
                }

                this.page++;
                this._getImages();
              })
            )
            .subscribe();
        }),
        finalize(() => {
          this.loadingImageId = null;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        error: error => {
          console.error("Failed to load image:", error);
        }
      });
  }

  protected onImageDeleted(imageId: ImageInterface["pk"]): void {
    this.images = this.images.filter(image => image.pk !== imageId);
    this.changeDetectorRef.markForCheck();
  }

  protected onImageRemovedFromCollection(event: {
    imageId: ImageInterface["pk"];
    collectionId: CollectionInterface["id"];
  }): void {
    if (event.collectionId !== this.options.collection) {
      return;
    }

    this.images = this.images.filter(image => image.pk !== event.imageId);
    this.changeDetectorRef.markForCheck();
  }

  protected onScroll() {
    if (isPlatformServer(this.platformId) || this.loading || this.loadingMore || this.next === null) {
      return;
    }

    if (this.utilsService.isNearBottom(this.windowRefService, this.elementRef)) {
      this.page++;
      this._getImages();
    }
  }

  private _getImages(): void {
    if (this.page > 1) {
      this.loadingMore = true;
    } else {
      this.loading = true;
    }

    this.store$.dispatch(
      new FindImages({
        options: {
          userId: this.user.id,
          gallerySerializer: true,
          page: this.page,
          ...this.options
        }
      })
    );
  }

  protected readonly ImageGalleryLayout = ImageGalleryLayout;
}
