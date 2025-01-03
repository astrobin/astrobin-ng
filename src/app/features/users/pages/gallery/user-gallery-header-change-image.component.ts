import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, Output, PLATFORM_ID } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { fromEvent, Subject, throttleTime } from "rxjs";
import { debounceTime, distinctUntilChanged, map, take, takeUntil } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { AuthActionTypes, ChangeUserProfileGalleryHeaderImage } from "@features/account/store/auth.actions";
import { Actions, ofType } from "@ngrx/effects";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { LoadingService } from "@shared/services/loading.service";
import { isPlatformBrowser } from "@angular/common";
import { UtilsService } from "@shared/services/utils/utils.service";
import { FindImages, FindImagesSuccess } from "@app/store/actions/image.actions";
import { WindowRefService } from "@shared/services/window-ref.service";
import { ImageService } from "@shared/services/image/image.service";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { fadeInOut } from "@shared/animations";

@Component({
  selector: "astrobin-user-gallery-header-change-image",
  template: `
    <p class="mb-3">
      {{ "Click on an image to set a new header for your gallery." | translate }}
    </p>

    <input
      class="form-control mb-3 user-gallery-quick-search"
      type="search"
      placeholder="{{ 'Search' | translate }}"
      [(ngModel)]="searchModel"
      (ngModelChange)="onSearchModelChange()"
    />

    <div class="d-flex flex-wrap gap-2 justify-content-center">
      <astrobin-loading-indicator
        *ngIf="loadingImages"
        @fadeInOut
        class="mt-2"
      ></astrobin-loading-indicator>

      <div
        *ngFor="let image of images; trackBy: imageTrackBy"
        @fadeInOut
        (click)="onSelect(image)"
        [ngbTooltip]="image.title"
        class="image"
        container="body"
      >
        <img [src]="image.finalGalleryThumbnail" alt="" />
      </div>

      <astrobin-loading-indicator
        *ngIf="loadingMoreImages"
        @fadeInOut
        class="mt-2"
      ></astrobin-loading-indicator>
    </div>
  `,
  styleUrls: ["./user-gallery-header-change-image.component.scss"],
  animations: [fadeInOut]
})
export class UserGalleryHeaderChangeImageComponent extends BaseComponentDirective implements AfterViewInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  @Output() imageChange = new EventEmitter<ImageInterface>();

  protected images: ImageInterface[] = [];
  protected loadingImages = false;
  protected loadingMoreImages = false;
  protected searchModel: string | null = null;

  private readonly _isBrowser: boolean;
  private _page = 1;
  private _next: string | null = null;
  private _searchSubject: Subject<string> = new Subject<string>();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly action$: Actions,
    public readonly translateService: TranslateService,
    public readonly imageApiService: ImageApiService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService,
    public readonly elementRef: ElementRef,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public readonly windowRefService: WindowRefService,
    public readonly imageService: ImageService
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    this._setupOnScroll();

    this.action$.pipe(
      ofType(AppActionTypes.FIND_IMAGES_SUCCESS),
      map((action: FindImagesSuccess) => action.payload),
      takeUntil(this.destroyed$)
    ).subscribe(payload => {
      this.loadingImages = false;
      this.loadingMoreImages = false;
      this._next = payload.response.next;
      this.images = this.images.concat(payload.response.results.map(image => ({
        ...image,
        finalGalleryThumbnail: this.imageService.getGalleryThumbnail(image)
      })));
    });

    this.store$.dispatch(new FindImages({
      options: {
        userId: this.user.id,
        gallerySerializer: true,
        includeStagingArea: true,
        page: this._page
      }
    }));

    this._searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(searchTerm => {
      this._page = 1;
      this.images = [];
      this.loadingImages = true;

      this.store$.dispatch(new FindImages({
        options: {
          userId: this.user.id,
          gallerySerializer: true,
          includeStagingArea: true,
          page: this._page,
          q: searchTerm
        }
      }));
    });

    this.loadingImages = true;
  }

  protected onSelect(image: ImageInterface) {
    this.action$.pipe(
      ofType(AuthActionTypes.CHANGE_USER_PROFILE_GALLERY_HEADER_IMAGE_SUCCESS),
      take(1)
    ).subscribe(() => {
      this.imageChange.emit(image);
      this.popNotificationsService.success(
        this.translateService.instant("Header image changed.")
      );
    });

    this.action$.pipe(
      ofType(AuthActionTypes.CHANGE_USER_PROFILE_GALLERY_HEADER_IMAGE_FAILURE),
      take(1)
    ).subscribe(() => {
      this.popNotificationsService.error(
        this.translateService.instant("Error changing header image!")
      );
    });

    this.store$.dispatch(
      new ChangeUserProfileGalleryHeaderImage({
        id: this.userProfile.id,
        imageId: image.hash || image.pk
      })
    );
  }

  protected onSearchModelChange() {
    this._searchSubject.next(this.searchModel);
  }

  protected imageTrackBy(index: number, image: ImageInterface) {
    return image.pk + "";
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
