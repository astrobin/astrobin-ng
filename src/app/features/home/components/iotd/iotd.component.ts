import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { IotdApiService, IotdInterface } from "@features/iotd/services/iotd-api.service";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { ImageService } from "@shared/services/image/image.service";
import { IotdStatsInterface } from "@features/iotd/types/iotd-stats.interface";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { fadeInOut } from "@shared/animations";

@Component({
  selector: "astrobin-iotd",
  template: `
    <astrobin-image-loading-indicator
      *ngIf="!iotd"
    ></astrobin-image-loading-indicator>

    <ng-container *ngIf="!!iotd">
      <a
        @fadeInOut
        (click)="openImage($event, iotd.image)"
        [href]="'/i/' + iotd.image"
        [ngStyle]="{
          'background-image': 'url(' + iotd.thumbnail + ')',
          'background-position': objectPosition || '50% 50%',
          'background-repeat': 'no-repeat',
          'background-size': 'cover'
        }"
        class="iotd-image"
      ></a>

      <div class="iotd-footer">
        <div class="
          d-flex
          gap-2 gap-sm-3
          align-items-center
          justify-content-center justify-content-sm-start
          flex-column flex-sm-row
        ">
          <fa-icon icon="trophy"></fa-icon>

          <div class="text-center text-sm-start">
            <div class="iotd-label">
              <span class="text">{{ "Image of the day" | translate }}</span>
              <a
                href="https://welcome.astrobin.com/iotd"
                target="_blank"
                rel="noopener"
                class="info-link"
              >
                <fa-icon icon="info-circle" class="info-icon"></fa-icon>
              </a>
              <a
                (click)="openStats()"
                href="#"
                class="stats-link ms-2"
                astrobinEventStopPropagation
                astrobinEventPreventDefault
              >
                <fa-icon icon="table-cells" class="stats-icon"></fa-icon>
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

    <ng-template #iotdStatsOffcanvasTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "IOTD/TP stats (last 365 days)" | translate }}</h5>
        <button type="button" class="btn-close" (click)="offcanvas.dismiss()"></button>
      </div>

      <div class="offcanvas-body">
        <div class="stats-container" *ngIf="iotdStats">
          <!-- Distribution of Astrophotographers -->
          <div class="table-section">
            <h2 class="section-title">{{ 'Distribution of astrophotographers' | translate }}</h2>
            <table class="stats-table table table-striped">
              <thead>
              <tr>
                <th class="category-header"></th>
                <th class="numeric-header">{{ 'Distinct awarded users' | translate }}</th>
                <th class="numeric-header">{{ 'Total awarded images' | translate }}</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td class="category-cell">{{ 'Image of the day' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.distinct_iotd_winners | number }}</td>
                <td class="numeric-cell">{{ iotdStats.total_iotds | number }}</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Top picks' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.distinct_tp_winners | number }}</td>
                <td class="numeric-cell">{{ iotdStats.total_tps | number }}</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Top pick nominations' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.distinct_tpn_winners | number }}</td>
                <td class="numeric-cell">{{ iotdStats.total_tpns | number }}</td>
              </tr>
              </tbody>
            </table>
            <p class="table-note">{{ 'This table shows the number of distinct astrophotographers who have been assigned and IOTD/TP award compared to the total number of images awarded.' | translate }}</p>
          </div>

          <!-- Distribution of subject types -->
          <div class="table-section">
            <h2 class="section-title">{{ 'Distribution of subject types' | translate }}</h2>
            <table class="stats-table table table-striped">
              <thead>
              <tr>
                <th class="category-header"></th>
                <th class="numeric-header">{{ 'Image of the day' | translate }}</th>
                <th class="numeric-header">{{ 'Top pick' | translate }}</th>
                <th class="numeric-header">{{ 'Top pick nominations' | translate }}</th>
                <th class="numeric-header">{{ 'Total submitted' | translate }}</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td class="category-cell">{{ 'Deep sky' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.deep_sky_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.deep_sky_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.deep_sky_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_deep_sky_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Solar system' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.solar_system_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.solar_system_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.solar_system_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_solar_system_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Extremely wide field' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.wide_field_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.wide_field_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.wide_field_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_wide_field_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Star trails' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.star_trails_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.star_trails_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.star_trails_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_star_trails_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Northern lights' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.northern_lights_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.northern_lights_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.northern_lights_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_northern_lights_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Noctilucent clouds' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.noctilucent_clouds_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.noctilucent_clouds_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.noctilucent_clouds_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_noctilucent_clouds_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Landscape' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.landscape_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.landscape_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.landscape_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_landscape_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Artificial satellite' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.artificial_satellite_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.artificial_satellite_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.artificial_satellite_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_artificial_satellite_images | number:'1.2-2' }}%</td>
              </tr>
              </tbody>
            </table>
            <p class="table-note">{{ 'This table shows the distribution of awards per subject type, compared to the popularity of images of that subject type.' | translate }}</p>
          </div>

          <!-- Distribution of data sources -->
          <div class="table-section">
            <h2 class="section-title">{{ 'Distribution of data sources' | translate }}</h2>
            <table class="stats-table table table-striped">
              <thead>
              <tr>
                <th class="category-header"></th>
                <th class="numeric-header">{{ 'Image of the day' | translate }}</th>
                <th class="numeric-header">{{ 'Top pick' | translate }}</th>
                <th class="numeric-header">{{ 'Top pick nominations' | translate }}</th>
                <th class="numeric-header">{{ 'Total submitted' | translate }}</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td class="category-cell">{{ 'Backyard' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.backyard_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.backyard_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.backyard_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_backyard_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Traveller' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.traveller_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.traveller_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.traveller_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_traveller_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Own remote observatory' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.own_remote_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.own_remote_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.own_remote_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_own_remote_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Amateur hosting facility' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.amateur_hosting_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.amateur_hosting_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.amateur_hosting_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_amateur_hosting_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Public amateur data' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.public_amateur_data_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.public_amateur_data_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.public_amateur_data_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_public_amateur_data_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Professional, scientific grade data' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.pro_data_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.pro_data_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.pro_data_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_pro_data_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Mix of multiple sources' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.mix_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.mix_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.mix_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_mix_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Other' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.other_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.other_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.other_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_other_images | number:'1.2-2' }}%</td>
              </tr>
              <tr>
                <td class="category-cell">{{ 'Unknown' | translate }}</td>
                <td class="numeric-cell">{{ iotdStats.unknown_iotds | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.unknown_tps | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.unknown_tpns | number:'1.2-2' }}%</td>
                <td class="numeric-cell">{{ iotdStats.total_unknown_images | number:'1.2-2' }}%</td>
              </tr>
              </tbody>
            </table>
            <p class="table-note">{{ 'This table shows the distribution of awards per data source, compared to the popularity of images acquired from that data source.' | translate }}</p>
          </div>
        </div>

        <astrobin-loading-indicator *ngIf="!iotdStats"></astrobin-loading-indicator>
      </div>
    </ng-template>
  `,
  styleUrls: ["./iotd.component.scss"],
  animations: [fadeInOut]
})
export class IotdComponent extends BaseComponentDirective implements OnInit {
  protected iotd: IotdInterface;
  protected objectPosition: string;
  protected iotdStats: IotdStatsInterface;

  @ViewChild("iotdStatsOffcanvasTemplate") private _iotdStatsOffcanvasTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly iotdApiService: IotdApiService,
    public readonly imageViewerService: ImageViewerService,
    public readonly viewContainerRef: ViewContainerRef,
    public readonly imageService: ImageService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService
  ) {
    super(store$);
  }

  ngOnInit() {
    this.iotdApiService.getCurrentIotd().subscribe(iotd => {
      this.iotd = iotd;
      this.objectPosition = this.imageService.getObjectPosition(iotd);
    });
  }

  openImage(event: MouseEvent, imageId: ImageInterface["pk"]) {
    if (event.metaKey || event.ctrlKey) {
      return;
    }

    event.preventDefault();

    this.imageViewerService.openSlideshow(
      this.componentId,
      imageId,
      FINAL_REVISION_LABEL,
      [],
      this.viewContainerRef,
      true
    ).subscribe();
  }

  openStats() {
    this.iotdStats = null;

    this.iotdApiService.getStats().subscribe(response => {
      if (response.results.length === 0) {
        return;
      }

      this.iotdStats = response.results[0];
    });

    this.offcanvasService.open(this._iotdStatsOffcanvasTemplate, {
      panelClass: "iotd-stats-offcanvas",
      position: this.deviceService.offcanvasPosition()
    });
  }
}
