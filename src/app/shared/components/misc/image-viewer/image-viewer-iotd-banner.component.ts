import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { ImageInterface } from "@core/interfaces/image.interface";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-image-viewer-iotd-banner",
  template: `
    <div class="iotd-banner">
      <div class="stitches-top"></div>
      <div class="iotd-banner-inner">
        <h3>
          <span class="iotd-banner-label">
            <fa-icon icon="trophy"></fa-icon>
            {{ "Image of the day" | translate }}
          </span>

          <span class="iotd-banner-date">
            {{ image.iotdDate }}
          </span>
        </h3>

        <ng-container [ngTemplateOutlet]="iotdInfoLinkTemplate"></ng-container>
      </div>
      <div class="stitches-bottom"></div>
    </div>

    <ng-template #iotdInfoLinkTemplate>
      <a class="ms-2 no-external-link-icon" href="https://welcome.astrobin.com/iotd" rel="noopener" target="_blank">
        <fa-icon icon="info-circle"></fa-icon>
      </a>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-iotd-banner.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerIotdBannerComponent extends BaseComponentDirective {
  @Input() image: ImageInterface;

  public constructor(public readonly store$: Store<MainState>) {
    super(store$);
  }
}
