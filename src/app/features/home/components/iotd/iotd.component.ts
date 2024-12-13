import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { IotdApiService, IotdInterface } from "@features/iotd/services/iotd-api.service";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";

@Component({
  selector: "astrobin-iotd",
  template: `
    <astrobin-image-loading-indicator *ngIf="!iotd"></astrobin-image-loading-indicator>

    <ng-container *ngIf="!!iotd">
      <img
        (click)="openImage(iotd.image)"
        [src]="iotd.thumbnail"
        [alt]="iotd.title"
        class="iotd-image"
      />

      <div class="iotd-footer">
        <div class="d-flex gap-3 align-items-center">
          <fa-icon icon="trophy"></fa-icon>

          <div>
          <span class="iotd-label">
            <span class="text">{{ "Image of the day" | translate }}</span>
              <a href="https://welcome.astrobin.com/iotd" target="_blank" rel="noopener" class="info-link">
                <fa-icon icon="info-circle" class="info-icon"></fa-icon>
              </a>
            </span>

            <div>
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

  constructor(
    public readonly store$: Store<MainState>,
    public readonly iotdApiService: IotdApiService,
    public readonly imageViewerService: ImageViewerService,
    public readonly viewContainerRef: ViewContainerRef
  ) {
    super(store$);
  }

  ngOnInit() {
    this.iotdApiService.getCurrentIotd().subscribe(iotd => this.iotd = iotd);
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
}
