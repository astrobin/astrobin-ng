import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { IotdApiService, IotdInterface } from "@features/iotd/services/iotd-api.service";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { ImageService } from "@shared/services/image/image.service";
import { ImageAlias } from "@shared/enums/image-alias.enum";

@Component({
  selector: "astrobin-iotd",
  template: `
    <astrobin-image-loading-indicator *ngIf="!iotd"></astrobin-image-loading-indicator>

    <ng-container *ngIf="!!iotd">
      <div
        (click)="openImage(iotd.image)"
        [ngStyle]="{
          'background-image': 'url(' + iotd.thumbnail + ')',
          'background-position': objectPosition || '50% 50%',
          'background-repeat': 'no-repeat',
          'background-size': 'cover'
        }"
        class="iotd-image"
      ></div>

      <div class="iotd-footer">
        <div class="
          d-flex
          gap-2 gap-sm-3
          align-items-center
          justify-content-center justify-content-sm-start
          flex-column flex-sm-row
        ">
          <fa-icon icon="trophy"></fa-icon>

          <div class="text-center text-sm-left">
            <div class="iotd-label">
              <span class="text">{{ "Image of the day" | translate }}</span>
              <a href="https://welcome.astrobin.com/iotd" target="_blank" rel="noopener" class="info-link">
                <fa-icon icon="info-circle" class="info-icon"></fa-icon>
              </a>
            </div>

            <div class="d-flex flex-column flex-sm-row align-items-center gap-sm-2">
              <span class="iotd-title">{{ iotd.title }}</span>
              <span class="iotd-users">{{ iotd.userDisplayNames }}</span>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ["./iotd.component.scss"]
})
export class IotdComponent extends BaseComponentDirective implements OnInit {
  protected iotd: IotdInterface;
  protected objectPosition: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly iotdApiService: IotdApiService,
    public readonly imageViewerService: ImageViewerService,
    public readonly viewContainerRef: ViewContainerRef,
    public readonly imageService: ImageService
  ) {
    super(store$);
  }

  ngOnInit() {
    this.iotdApiService.getCurrentIotd().subscribe(iotd => {
      this.iotd = iotd;
      this.objectPosition = this.imageService.getObjectPosition(iotd);
    });
  }

  openImage(imageId: ImageInterface["pk"]) {
    this.imageViewerService.openSlideshow(
      this.componentId,
      imageId,
      FINAL_REVISION_LABEL,
      [],
      this.viewContainerRef,
      true
    ).subscribe();  }

  protected readonly ImageAlias = ImageAlias;
}
