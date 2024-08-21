import { isPlatformBrowser, Location } from "@angular/common";
import { ComponentRef, Inject, Injectable, PLATFORM_ID, ViewContainerRef } from "@angular/core";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { LoadImage } from "@app/store/actions/image.actions";
import { Observable } from "rxjs";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { filter, switchMap, take } from "rxjs/operators";
import { ImageViewerComponent } from "@shared/components/misc/image-viewer/image-viewer.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { UtilsService } from "@shared/services/utils/utils.service";
import { DeviceService } from "@shared/services/device.service";

@Injectable({
  providedIn: "root"
})
export class ImageViewerService extends BaseService {
  activeImageViewer?: ComponentRef<ImageViewerComponent>;

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<MainState>,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly windowRefService: WindowRefService,
    public readonly location: Location,
    public readonly deviceService: DeviceService
  ) {
    super(loadingService);
  }

  openImageViewer(
    imageId: ImageInterface["hash"] | ImageInterface["pk"],
    revisionLabel: ImageRevisionInterface["label"],
    fullscreenMode: boolean,
    navigationContext: (ImageInterface["hash"] | ImageInterface["pk"])[],
    viewContainerRef: ViewContainerRef
  ): ComponentRef<ImageViewerComponent> {
    if (this.activeImageViewer) {
      return this.activeImageViewer;
    }

    this.activeImageViewer = viewContainerRef.createComponent(ImageViewerComponent);
    this.activeImageViewer.instance.showCloseButton = true;
    this.activeImageViewer.instance.fullscreenMode = true;
    this.activeImageViewer.instance.loading = true;

    this.activeImageViewer.instance.initialized.pipe(
      switchMap(() => this.loadImage(imageId))
    ).subscribe(image => {
      this.activeImageViewer.instance.setImage(
        image,
        revisionLabel,
        fullscreenMode,
        navigationContext,
        true);
      this.activeImageViewer.instance.loading = false;
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
    this._changeBodyOverflow("hidden");
  }

  private _resumeBodyScrolling(): void {
    this._changeBodyOverflow("auto");
  }

  private _changeBodyOverflow(value: "hidden" | "auto"): void {
    if (isPlatformBrowser(this.platformId)) {
      const _document = this.windowRefService.nativeWindow.document;
      if (_document) {
        _document.body.classList.toggle("overflow-hidden", value === "hidden");
      }
    }
  }
}
