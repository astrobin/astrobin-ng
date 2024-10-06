import { Component, ElementRef, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { FindImages, FindImagesSuccess, UndeleteImage, UndeleteImageSuccess } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { map, takeUntil } from "rxjs/operators";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { fromEvent, throttleTime } from "rxjs";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";

@Component({
  selector: "astrobin-user-gallery-trash",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper; else accessDeniedTemplate">
      <ng-container *ngIf="!loading; else loadingTemplate">
        <ng-container *ngIf="images.length > 0; else nothingHereTemplate">
          <ng-container [ngTemplateOutlet]="trashTemplate"></ng-container>
        </ng-container>
      </ng-container>
    </ng-container>

    <ng-template #accessDeniedTemplate>
      <p translate>Access denied.</p>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>

    <ng-template #nothingHereTemplate>
      <astrobin-nothing-here></astrobin-nothing-here>
    </ng-template>

    <ng-template #trashTemplate>
      <div class="table-container">
        <table class="table table-striped">
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
          <tr *ngFor="let image of images">
            <td class="thumbnail">
              <img [src]="image.finalGalleryThumbnail" alt="" />
            </td>
            <td class="title" [attr.data-label]="'Title' | translate">{{ image.title }}</td>
            <td class="uploaded" [attr.data-label]="'Uploaded' | translate">{{ image.uploaded | localDate | date: 'mediumDate' }}</td>
            <td class="deleted" [attr.data-label]="'Deleted' | translate">{{ image.deleted | localDate | date: 'mediumDate' }}</td>
            <td class="restore">
              <button
                (click)="restoreImage(image)"
                class="btn btn-link btn-no-block link-primary"
                translate="Restore"
              >
              </button>
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

  protected next: string | null = null;
  protected page = 1;
  protected images: ImageInterface[] = [];
  protected loading = false;
  protected loadingMore = false;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly utilsService: UtilsService
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

    actions$.pipe(
      ofType(AppActionTypes.UNDELETE_IMAGE_SUCCESS),
      map((action: UndeleteImageSuccess) => action.payload.pk),
      takeUntil(this.destroyed$)
    ).subscribe(pk => {
      this.images = this.images.filter(image => image.pk !== pk);
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
      trash: true,
    }));
  }

  protected restoreImage(image: ImageInterface): void {
    this.store$.dispatch(new UndeleteImage({ pk: image.pk }));
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
