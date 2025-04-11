import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { ElementRef, OnChanges, OnInit, SimpleChanges, Component, Inject, Input, PLATFORM_ID } from "@angular/core";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { FindImagesSuccess, UndeleteImageSuccess, FindImages, UndeleteImage } from "@app/store/actions/image.actions";
import { MainState } from "@app/store/state";
import { ImageInterface } from "@core/interfaces/image.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import { ImageService } from "@core/services/image/image.service";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { SubscriptionName } from "@core/types/subscription-name.type";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Observable, fromEvent, throttleTime } from "rxjs";
import { filter, map, switchMap, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-user-gallery-trash",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper; else accessDeniedTemplate">
      <ng-container *ngIf="permission$ | async as permission">
        <ng-container *ngIf="permission.mayAccess; else ultimateRequiredTemplate">
          <ng-container *ngIf="!loading; else loadingTemplate">
            <ng-container *ngIf="images.length > 0; else nothingHereTemplate">
              <ng-container [ngTemplateOutlet]="trashTemplate"></ng-container>
            </ng-container>
          </ng-container>
        </ng-container>
      </ng-container>
    </ng-container>

    <ng-template #accessDeniedTemplate>
      <p translate>Access denied.</p>
    </ng-template>

    <ng-template #ultimateRequiredTemplate>
      <p>
        <span translate>Access to this feature is part of the AstroBin Ultimate plan.</span>&nbsp;
        <a href="https://welcome.astrobin.com/pricing" translate>Upgrade now!</a>
      </p>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>

    <ng-template #nothingHereTemplate>
      <astrobin-nothing-here></astrobin-nothing-here>
    </ng-template>

    <ng-template #trashTemplate>
      <button
        [class.loading]="loading || loadingMore"
        (click)="emptyTrash()"
        class="btn btn-secondary mb-3 float-md-end"
        translate="Empty trash"
      ></button>

      <div class="table-container">
        <table class="table table-striped table-mobile-support">
          <thead>
            <tr>
              <th class="thumbnail"></th>
              <th class="title" translate="Title"></th>
              <th class="uploaded" translate="Uploaded"></th>
              <th class="deleted" translate="Deleted"></th>
              <th class="restore"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let image of images" [class.loading]="restoringImage === image.pk">
              <td class="thumbnail">
                <img [src]="imageService.getGalleryThumbnail(image)" alt="" />
              </td>
              <td [attr.data-label]="'Title' | translate" class="title">{{ image.title }}</td>
              <td [attr.data-label]="'Uploaded' | translate" class="uploaded">
                {{ image.uploaded | localDate | date: "mediumDate" }}
              </td>
              <td [attr.data-label]="'Deleted' | translate" class="deleted">
                {{ image.deleted | localDate | date: "mediumDate" }}
              </td>
              <td class="restore">
                <button
                  [class.loading]="restoringImage === image.pk"
                  (click)="restoreImage(image)"
                  class="btn btn-link btn-no-block link-primary"
                  translate="Restore"
                ></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-trash.component.scss"]
})
export class UserGalleryTrashComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  protected permission$: Observable<{ mayAccess: boolean }> = this.currentUserProfile$.pipe(
    switchMap(profile =>
      this.userSubscriptionService.hasValidSubscription$(profile, [
        SubscriptionName.ASTROBIN_ULTIMATE_2020,
        SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY,
        SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY
      ])
    ),
    map(isUltimate => ({ mayAccess: isUltimate }))
  );
  protected next: string | null = null;
  protected page = 1;
  protected images: ImageInterface[] = [];
  protected loading = false;
  protected loadingMore = false;
  protected restoringImage = null;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly utilsService: UtilsService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly commonApiService: CommonApiService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly imageService: ImageService
  ) {
    super(store$);

    actions$
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
              trash: true
            })
        ),
        map(payload => payload.response),
        takeUntil(this.destroyed$)
      )
      .subscribe(response => {
        if (!!response.prev) {
          this.images = [...this.images, ...response.results];
        } else {
          this.images = response.results;
        }
        this.next = response.next;
        this.loadingMore = false;
        this.loading = false;
      });

    actions$
      .pipe(
        ofType(AppActionTypes.UNDELETE_IMAGE_SUCCESS),
        map((action: UndeleteImageSuccess) => action.payload.pk),
        takeUntil(this.destroyed$)
      )
      .subscribe(pk => {
        this.images = this.images.filter(image => image.pk !== pk);
        this.restoringImage = null;
      });

    actions$
      .pipe(
        ofType(AppActionTypes.UNDELETE_IMAGE_FAILURE),
        map((action: UndeleteImageSuccess) => action.payload.pk),
        takeUntil(this.destroyed$)
      )
      .subscribe(pk => {
        this.restoringImage = null;
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
  }

  protected restoreImage(image: ImageInterface): void {
    this.store$.dispatch(new UndeleteImage({ pk: image.pk }));
    this.restoringImage = image.pk;
  }

  protected emptyTrash(): void {
    this.loading = true;
    this.commonApiService.emptyTrash(this.user.id).subscribe({
      next: () => {
        this.images = [];
        this.loading = false;
        this.popNotificationsService.success(this.translateService.instant("Trash emptied."));
      },
      error: () => {
        this.loading = false;
        this.popNotificationsService.error(this.translateService.instant("An error occurred."));
      }
    });
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
          trash: true
        }
      })
    );
  }

  private _onScroll() {
    if (isPlatformServer(this.platformId) || this.loading || this.loadingMore || this.next === null) {
      return;
    }

    if (this.utilsService.isNearBottom(this.windowRefService, this.elementRef)) {
      this.page++;
      this._getImages();
    }
  }
}
