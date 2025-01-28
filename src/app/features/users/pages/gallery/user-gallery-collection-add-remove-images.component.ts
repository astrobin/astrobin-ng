import { Component, ElementRef, Inject, Input, OnInit, PLATFORM_ID } from "@angular/core";
import { UserInterface } from "@core/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { Actions, ofType } from "@ngrx/effects";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import { FindImages, FindImagesSuccess } from "@app/store/actions/image.actions";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { isPlatformBrowser } from "@angular/common";
import { fromEvent, throttleTime } from "rxjs";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { fadeInOut } from "@shared/animations";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { AddImageToCollection, AddImageToCollectionFailure, AddImageToCollectionSuccess, LoadCollections, RemoveImageFromCollection, RemoveImageFromCollectionFailure, RemoveImageFromCollectionSuccess } from "@app/store/actions/collection.actions";
import { ImageService } from "@core/services/image/image.service";

@Component({
  selector: "astrobin-user-gallery-collection-add-remove-images",
  template: `
    <div class="d-flex flex-wrap gap-2 justify-content-center">
      <p class="mb-3">
        {{ "Click on images to add/remove them." | translate }}
      </p>

      <astrobin-loading-indicator
        *ngIf="loadingImages"
        @fadeInOut
        class="mt-2"
      ></astrobin-loading-indicator>

      <div
        *ngFor="let image of images"
        @fadeInOut
        (click)="toggleSelected(image)"
        [class.selected]="collection.images?.includes(image.pk)"
        [class.toggling]="togglingImages.includes(image.pk)"
        [class.wip]="image.isWip"
        [ngbTooltip]="image.title"
        class="image"
        container="body"
      >
        <img [src]="imageService.getGalleryThumbnail(image)" alt="" />
        <fa-icon class="check" icon="circle-check"></fa-icon>
        <fa-icon class="loading-indicator" icon="circle-notch" animation="spin"></fa-icon>
        <fa-icon class="wip" icon="lock"></fa-icon>
      </div>

      <astrobin-loading-indicator
        *ngIf="loadingMoreImages"
        @fadeInOut
        class="mt-2"
      ></astrobin-loading-indicator>
    </div>
  `,
  styleUrls: ["./user-gallery-collection-add-remove-images.component.scss"],
  animations: [fadeInOut]
})
export class UserGalleryCollectionAddRemoveImagesComponent extends BaseComponentDirective implements OnInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() collection: CollectionInterface;

  protected images: ImageInterface[] = [];
  protected loadingImages = false;
  protected loadingMoreImages = false;
  protected togglingImages = [];

  private readonly _isBrowser: boolean;
  private _page = 1;
  private _next: string | null = null;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly action$: Actions,
    public readonly elementRef: ElementRef,
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public readonly utilsService: UtilsService,
    public readonly imageService: ImageService
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    super.ngOnInit();

    this._setupOnScroll();

    this.action$.pipe(
      ofType(AppActionTypes.FIND_IMAGES_SUCCESS),
      map((action: FindImagesSuccess) => action.payload),
      takeUntil(this.destroyed$)
    ).subscribe(payload => {
      this.loadingImages = false;
      this.loadingMoreImages = false;
      this._next = payload.response.next;
      this.images = this.images.concat(payload.response.results);
    });

    this.store$.dispatch(new FindImages({
      options: {
        userId: this.user.id,
        gallerySerializer: true,
        includeStagingArea: true,
        page: this._page
      }
    }));

    // Loads the collection again to get the images in it.
    this.store$.dispatch(new LoadCollections({
      params: {
        ids: [this.collection.id],
        action: "add-remove-images"
      }
    }));

    this.loadingImages = true;
  }

  protected toggleSelected(image: ImageInterface) {
    this.togglingImages.push(image.pk);

    this.action$.pipe(
      ofType(
        AppActionTypes.ADD_IMAGE_TO_COLLECTION_SUCCESS,
        AppActionTypes.REMOVE_IMAGE_FROM_COLLECTION_SUCCESS,
        AppActionTypes.ADD_IMAGE_TO_COLLECTION_FAILURE,
        AppActionTypes.REMOVE_IMAGE_FROM_COLLECTION_FAILURE
      ),
      filter((action:
        AddImageToCollectionSuccess |
        AddImageToCollectionFailure |
        RemoveImageFromCollectionSuccess |
        RemoveImageFromCollectionFailure) => (action.payload.collectionId === this.collection.id)
      ),
      take(1)
    ).subscribe(() => {
      this.togglingImages = this.togglingImages.filter(pk => pk !== image.pk);
    });

    this.action$.pipe(
      ofType(AppActionTypes.ADD_IMAGE_TO_COLLECTION_SUCCESS),
      map((action: AddImageToCollectionSuccess) => action.payload.collectionId),
      filter(collectionId => collectionId === this.collection.id),
      take(1)
    ).subscribe(() => {
      this.collection.images = [...(this.collection.images || []), image.pk];
    });

    this.action$.pipe(
      ofType(AppActionTypes.REMOVE_IMAGE_FROM_COLLECTION_SUCCESS),
      map((action: RemoveImageFromCollectionSuccess) => action.payload.collectionId),
      filter(collectionId => collectionId === this.collection.id),
      take(1)
    ).subscribe(() => {
      this.collection.images = (this.collection.images || []).filter(pk => pk !== image.pk);
    });

    if (this.collection.images?.includes(image.pk)) {
      this.store$.dispatch(new RemoveImageFromCollection({
        collectionId: this.collection.id,
        imageId: image.pk
      }));
    } else {
      this.store$.dispatch(new AddImageToCollection({
        collectionId: this.collection.id,
        imageId: image.pk
      }));
    }
  }

  private _setupOnScroll() {
    if (!this._isBrowser) {
      return;
    }

    const scrollableElement = UtilsService.getScrollableParent(
      this.elementRef.nativeElement,
      this.windowRefService
    );

    fromEvent(scrollableElement, "scroll")
      .pipe(
        throttleTime(250),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
          const isNearBottom = this.utilsService.isNearBottom(this.windowRefService, this.elementRef);

          if (isNearBottom && !this.loadingImages && !this.loadingMoreImages && this._next) {
            this.loadingMoreImages = true;
            this._page++;

            this.store$.dispatch(new FindImages({
              options: {
                userId: this.user.id,
                gallerySerializer: true,
                includeStagingArea: true,
                page: this._page
              }
            }));
          }
        }
      );
  }
}
