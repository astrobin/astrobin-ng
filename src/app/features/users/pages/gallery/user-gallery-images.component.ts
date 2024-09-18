import { Component, ElementRef, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges, ViewContainerRef } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { FindImages, FindImagesSuccess } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { map, takeUntil } from "rxjs/operators";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { MasonryLayoutGridItem } from "@shared/directives/masonry-layout.directive";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { LoadingService } from "@shared/services/loading.service";
import { ImageService } from "@shared/services/image/image.service";
import { Router } from "@angular/router";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { fromEvent, throttleTime } from "rxjs";
import { FindImagesOptionsInterface } from "@shared/services/api/classic/images/image/image-api.service";
import { NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";

@Component({
  selector: "astrobin-user-gallery-images",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <ng-container *ngIf="loading">
        <astrobin-user-gallery-loading
          *ngIf="loadingPlaceholdersCount"
          [numberOfImages]="loadingPlaceholdersCount"
        ></astrobin-user-gallery-loading>
      </ng-container>

      <astrobin-nothing-here
        *ngIf="!loading && images.length === 0"
        [withAlert]="false"
        [withInfoSign]="false"
      ></astrobin-nothing-here>

      <div
        *ngIf="!loading && images.length > 0"
        class="masonry-layout-container"
        [astrobinMasonryLayout]="images"
        [alias]="ImageAlias.REGULAR"
        (gridItemsChange)="onGridItemsChange($event)"
      >
        <a
          *ngFor="let item of gridItems"
          (click)="openImage(item)"
          [style.width.px]="item.displayWidth * averageHeight / item.displayHeight"
          [style.flex-grow]="item.displayWidth * averageHeight / item.displayHeight"
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

          <div class="hover-overlay"></div>

          <fa-icon
            *ngIf="item.isWip"
            [ngbTooltip]="'This image is in your staging area' | translate"
            container="body"
            triggers="hover click"
            icon="lock"
            class="wip-icon"
          ></fa-icon>
        </a>
      </div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-images.component.scss"]
})
export class UserGalleryImagesComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() options: FindImagesOptionsInterface;

  protected readonly ImageAlias = ImageAlias;

  protected next: string | null = null;
  protected page = 1;
  protected images: ImageInterface[] = [];
  protected loading = false;
  protected loadingMore = false;
  protected gridItems: MasonryLayoutGridItem[] = [];
  protected averageHeight = 200;
  protected loadingPlaceholdersCount: number;

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
  ) {
    super(store$);

    actions$.pipe(
      ofType(AppActionTypes.FIND_IMAGES_SUCCESS),
      map((action: FindImagesSuccess) => action.payload),
      takeUntil(this.destroyed$)
    ).subscribe(payload => {
      if (payload.prev !== null) {
        this.images = [...this.images, ...payload.results];
      } else {
        this.images = payload.results;
      }
      this.next = payload.next;
      this.loadingMore = false;
      this.loading = false;
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
    if (changes.user && changes.user.currentValue) {
      this._getImages();
    }

    if (changes.userProfile && changes.userProfile.currentValue) {
      this.loadingPlaceholdersCount = Math.min(
        changes.userProfile.currentValue.imageCount,
        this.paginationConfig.pageSize
      );
    }
  }

  onGridItemsChange(event: { gridItems: any[]; averageHeight: number }): void {
    this.gridItems = event.gridItems;
    this.averageHeight = event.averageHeight;
  }

  openImage(item: MasonryLayoutGridItem): void {
    let activeImageViewer = this.imageViewerService.activeImageViewer;
    const image = item as ImageInterface;

    const imageId = image.hash || image.pk;
    const thumbnails = this.images.map(image => ({
      imageId: image.hash || image.pk,
      thumbnailUrl: image.finalGalleryThumbnail
    }));

    if (!activeImageViewer) {
      activeImageViewer = this.imageViewerService.openImageViewer(
        imageId,
        FINAL_REVISION_LABEL,
        false,
        this.componentId,
        thumbnails,
        this.viewContainerRef
      );
    } else {
      this.loadingService.setLoading(true);
      this.imageService.loadImage(imageId).subscribe({
        next: loadedImage => {
          activeImageViewer.instance.searchComponentId = this.componentId;
          activeImageViewer.instance.setImage(
            loadedImage,
            FINAL_REVISION_LABEL,
            false,
            thumbnails,
            true
          );
          this.loadingService.setLoading(false);
        },
        error: () => {
          this.router.navigateByUrl("/404", { skipLocationChange: true }).then(() => {
            this.loadingService.setLoading(false);
          });
        }
      });
    }
  }

  private _getImages(): void {
    if (this.page > 1) {
      this.loadingMore = true;
    } else {
      this.loading = true;
    }

    this.store$.dispatch(new FindImages({
      userId: this.user.id,
      gallerySerializer: true,
      page: this.page,
      ...this.options
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
