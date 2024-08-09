import { Component, EventEmitter, HostListener, Input, OnInit, Output } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { DeviceService } from "@shared/services/device.service";
import { LoadImage } from "@app/store/actions/image.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { filter, take } from "rxjs/operators";

@Component({
  selector: "astrobin-image-viewer",
  templateUrl: "./image-viewer.component.html",
  styleUrls: ["./image-viewer.component.scss"]
})
export class ImageViewerComponent extends BaseComponentDirective implements OnInit {
  readonly ImageAlias = ImageAlias;

  loading = false;
  alias: ImageAlias;
  hasOtherImages = false;
  currentIndex = null;

  @Input()
  image: ImageInterface;

  @Input()
  navigationContext: (ImageInterface["hash"] | ImageInterface["pk"])[];

  @Output()
  closeViewer = new EventEmitter<void>();

  @Output()
  initialized = new EventEmitter<void>();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly deviceService: DeviceService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    if (this.deviceService.smMax()) {
      this.alias = ImageAlias.REGULAR;
    } else if (this.deviceService.xlMin()) {
      this.alias = ImageAlias.QHD;
    } else {
      this.alias = ImageAlias.HD;
    }

    this.initialized.emit();
  }

  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    this.close();
  }

  updateNavigationContextInformation(): void {
    this.hasOtherImages = this.navigationContext.filter(id => id !== this.image.hash && id !== this.image.pk).length > 0;
    this.updateCurrentImageIndexInNavigationContext();
    this.loadNextImages(5);
    this.loadPreviousImages(5);
  }

  updateCurrentImageIndexInNavigationContext(): void {
    const byHash = this.navigationContext.indexOf(this.image.hash);
    const byPk = this.navigationContext.indexOf(this.image.pk);

    this.currentIndex = byHash !== -1 ? byHash : byPk;
  }

  loadNextImages(n: number): void {
    for (let i = 1; i <= n; i++) {
      const nextIndex = this.currentIndex + i;
      if (nextIndex < this.navigationContext.length) {
        this.store$.dispatch(new LoadImage({ imageId: this.navigationContext[nextIndex] }));
      }
    }
  }

  loadPreviousImages(n: number): void {
    for (let i = 1; i <= n; i++) {
      const previousIndex = this.currentIndex - i;
      if (previousIndex >= 0) {
        this.store$.dispatch(new LoadImage({ imageId: this.navigationContext[previousIndex] }));
      }
    }
  }

  @HostListener("document:keydown.arrowRight", ["$event"])
  onNextClicked(): void {
    if (this.currentIndex < this.navigationContext.length - 1) {
      this.store$.pipe(
        select(selectImage, this.navigationContext[this.currentIndex + 1]),
        filter(image => !!image),
        take(1)
      ).subscribe(image => {
        this.image = image;
        this.updateNavigationContextInformation();
      });
    }
  }

  @HostListener("document:keydown.arrowLeft", ["$event"])
  onPreviousClicked(): void {
    if (this.currentIndex > 0) {
      this.store$.pipe(
        select(selectImage, this.navigationContext[this.currentIndex - 1]),
        filter(image => !!image),
        take(1)
      ).subscribe(image => {
        this.image = image;
        this.updateNavigationContextInformation();
      });
    }
  }

  close(): void {
    this.closeViewer.emit();
  }
}
