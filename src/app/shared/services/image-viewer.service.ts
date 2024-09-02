import { Location } from "@angular/common";
import { ComponentRef, Inject, Injectable, PLATFORM_ID, ViewContainerRef } from "@angular/core";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { DeleteImageSuccess, LoadImage } from "@app/store/actions/image.actions";
import { Observable } from "rxjs";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { ImageViewerComponent, ImageViewerNavigationContext } from "@shared/components/misc/image-viewer/image-viewer.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { UtilsService } from "@shared/services/utils/utils.service";
import { DeviceService } from "@shared/services/device.service";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class ImageViewerService extends BaseService {
  activeImageViewer?: ComponentRef<ImageViewerComponent>;

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly windowRefService: WindowRefService,
    public readonly location: Location,
    public readonly deviceService: DeviceService,
    public readonly router: Router
  ) {
    super(loadingService);

    this.actions$.pipe(
      ofType(AppActionTypes.DELETE_IMAGE_SUCCESS),
      takeUntil(this.destroyed$),
      map((action: DeleteImageSuccess) => action.payload.pk)
    ).subscribe((pk: ImageInterface["pk"]) => {
      if (this.activeImageViewer && this.activeImageViewer.instance.image.pk === pk) {
        this.closeActiveImageViewer(false);
      }
    });
  }

  openImageViewer(
    imageId: ImageInterface["hash"] | ImageInterface["pk"],
    revisionLabel: ImageRevisionInterface["label"],
    fullscreenMode: boolean,
    searchComponentId: string,
    navigationContext: ImageViewerNavigationContext,
    viewContainerRef: ViewContainerRef
  ): ComponentRef<ImageViewerComponent> {
    if (this.activeImageViewer) {
      return this.activeImageViewer;
    }

    this.activeImageViewer = viewContainerRef.createComponent(ImageViewerComponent);
    this.activeImageViewer.instance.showCloseButton = true;
    this.activeImageViewer.instance.fullscreenMode = true;
    this.activeImageViewer.instance.searchComponentId = searchComponentId;

    this.activeImageViewer.instance.initialized.pipe(
      switchMap(() => this.loadImage(imageId))
    ).subscribe(image => {
      this.activeImageViewer.instance.setImage(
        image,
        revisionLabel,
        fullscreenMode,
        navigationContext,
        true);
    }, () => {
      this.router.navigateByUrl("/404", { skipLocationChange: true });
    });

    this.activeImageViewer.instance.closeViewer.subscribe(() => {
      this.closeActiveImageViewer(true);
    });

    this._stopBodyScrolling();

    return this.activeImageViewer;
  }

  loadImage(imageId: ImageInterface["hash"] | ImageInterface["pk"]): Observable<ImageInterface> {
    return new Observable<ImageInterface>(observer => {
      this.store$.pipe(
        select(selectImage, imageId),
        filter(image => !!image),
        take(1)
      ).subscribe(image => {
        observer.next(image);
        observer.complete();
      }, () => {
        observer.error();
        observer.complete();
      });

      this.actions$.pipe(
        ofType(AppActionTypes.LOAD_IMAGE_FAILURE),
        take(1)
      ).subscribe(() => {
        observer.error();
        observer.complete();
      });

      this.store$.dispatch(new LoadImage({ imageId }));
    });
  }

  closeActiveImageViewer(pushState: boolean): void {
    if (this.activeImageViewer) {
      this.store$.dispatch(new HideFullscreenImage());
      this.activeImageViewer.destroy();
      this.activeImageViewer = undefined;
      this._resumeBodyScrolling();

      if (pushState) {
        let path = UtilsService.removeUrlParam(this.location.path(), "i");
        path = UtilsService.removeUrlParam(path, "r");
        path = path.split("#")[0];

        this.windowRefService.pushState(
          {},
          path
        );
      }
    }
  }

  private _stopBodyScrolling(): void {
    this.windowRefService.changeBodyOverflow("hidden");
  }

  private _resumeBodyScrolling(): void {
    this.windowRefService.changeBodyOverflow("auto");
  }
}
