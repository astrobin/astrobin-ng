import { ComponentRef, Inject, Injectable, PLATFORM_ID, ViewContainerRef } from "@angular/core";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
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
import { isPlatformBrowser } from "@angular/common";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";

@Injectable({
  providedIn: "root"
})
export class ImageViewerService extends BaseService {
  private _activeImageViewer?: ComponentRef<ImageViewerComponent>;

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<MainState>,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly windowRefService: WindowRefService
  ) {
    super(loadingService);
  }

  openImageViewer(
    imageId: ImageInterface["hash"] | ImageInterface["pk"],
    navigationContext: (ImageInterface["hash"] | ImageInterface["pk"])[],
    viewContainerRef: ViewContainerRef
  ): ComponentRef<ImageViewerComponent> {
    this.closeActiveImageViewer();

    this._activeImageViewer = viewContainerRef.createComponent(ImageViewerComponent);

    this._activeImageViewer.instance.initialized.pipe(
      switchMap(() => this.loadImage(imageId)),
    ).subscribe(image => {
      this._activeImageViewer.instance.setImage(image, FINAL_REVISION_LABEL, navigationContext);
    });

    this._activeImageViewer.instance.closeViewer.subscribe(() => {
      this.closeActiveImageViewer();
    });

    this._stopBodyScrolling();

    return this._activeImageViewer;
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
      });

      this.store$.dispatch(new LoadImage({ imageId }));
    });
  }

  closeActiveImageViewer() {
    if (this._activeImageViewer) {
      this.store$.dispatch(new HideFullscreenImage());
      this._activeImageViewer.destroy();
      this._activeImageViewer = undefined;
      this._resumeBodyScrolling();
    }
  }

  private _stopBodyScrolling(): void {
    if (isPlatformBrowser(this.platformId)) {
      const _document = this.windowRefService.nativeWindow.document;
      _document.body.style.overflow = "hidden";
    }
  }

  private _resumeBodyScrolling(): void {
    if (isPlatformBrowser(this.platformId)) {
      const _document = this.windowRefService.nativeWindow.document;
      _document.body.style.overflow = "auto";
    }
  }
}
