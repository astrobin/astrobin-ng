import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { select, Store } from "@ngrx/store";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { filter, map, take } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { MainState } from "@app/store/state";
import { ImageIotdTpStatsInterface } from "@features/iotd/types/image-iotd-tp-stats.interface";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { ImageInterface } from "@shared/interfaces/image.interface";

@Component({
  selector: "astrobin-image-viewer-iotd-tp-stats",
  template: `
    <ng-container *ngIf="getIotdTpStatsLegend$() | async as legend">

      <ngb-accordion *ngIf="iotdTpStats; else loadingTemplate" #accordion="ngbAccordion" class="iotd-stats-accordion">
        <ngb-panel>
          <ng-template ngbPanelTitle>
            <div class="image-iotd-tp-stats-item">
              <span class="name">{{ "Submitted" | translate }}</span>
              <span class="value">{{ image.submittedForIotdTpConsideration | localDate | date: "short" }}</span>
            </div>
          </ng-template>

          <ng-template ngbPanelContent>
            {{ legend["submittedForIotdTpConsideration"] }}
          </ng-template>
        </ngb-panel>
        <ngb-panel>
          <ng-template ngbPanelTitle>
            <div class="image-iotd-tp-stats-item">
                  <span
                    class="name">{{ "Views by Submitters (available since September 19th, 2023)" | translate }}</span>
              <span class="value">{{ iotdTpStats.submitter_views_percentage }}</span>
            </div>
          </ng-template>

          <ng-template ngbPanelContent>
            {{ legend["submitter_views_percentage"] }}
          </ng-template>
        </ngb-panel>

        <ngb-panel>
          <ng-template ngbPanelTitle>
            <div class="image-iotd-tp-stats-item">
              <span class="name">{{ "Promotions by Submitters" | translate }}</span>
              <span class="value">{{ iotdTpStats.submissions }}</span>
            </div>
          </ng-template>

          <ng-template ngbPanelContent>
            {{ legend["submissions"] }}
          </ng-template>
        </ngb-panel>

        <ngb-panel>
          <ng-template ngbPanelTitle>
            <div class="image-iotd-tp-stats-item">
              <span class="name">{{ "Promotions by Reviewers" | translate }}</span>
              <span class="value">{{ iotdTpStats.votes }}</span>
            </div>
          </ng-template>

          <ng-template ngbPanelContent>
            {{ legend["votes"] }}
          </ng-template>
        </ngb-panel>

        <ngb-panel>
          <ng-template ngbPanelTitle>
            <div class="image-iotd-tp-stats-item">
              <span class="name">{{ "Early dismissal" | translate }}</span>
              <span class="value">{{ iotdTpStats.early_dismissal }}</span>
            </div>
          </ng-template>

          <ng-template ngbPanelContent>
            {{ legend["early_dismissal"] }}
          </ng-template>
        </ngb-panel>
      </ngb-accordion>
    </ng-container>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-iotd-tp-stats.component.scss"]
})
export class ImageViewerIotdTpStatsComponent implements OnInit {
  @Input() protected image: ImageInterface;

  protected iotdTpStats: ImageIotdTpStatsInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly imageApiService: ImageApiService
  ) {}

  ngOnInit(): void {
    this.imageApiService.getImageStats(this.image.hash || this.image.pk).subscribe(stats => {
      this.iotdTpStats = stats;
    });
  }

  getIotdTpStatsLegend$(): Observable<{ [key: string]: string }> {
    return this.store$.pipe(
      select(selectBackendConfig),
      filter(backendConfig => !!backendConfig),
      take(1),
      map(backendConfig => {
        return {
          "submittedForIotdTpConsideration" : this.translateService.instant(
            "The date and time when this image was submitted for IOTD/TP consideration. AstroBin may " +
            "automatically resubmit your image multiple times if necessary."
          ),
          "submitter_views_percentage": this.translateService.instant(
            "Every image is assigned to {{ 0 }} of available Submitters. In the event that at least 80% of them " +
            "don't view the image before its time in the IOTD/TP process expires, it's assigned to the other {{ 0 }} " +
            "of Submitters and the process begins anew.", {
              0: `${backendConfig.IOTD_DESIGNATED_SUBMITTERS_PERCENTAGE}%`,
            }
          ),
          "submissions": this.translateService.instant(
            "When {{ 0 }} distinct Submitters promote the image, it moves on to the next stage of the process: " +
            "evaluation for Top Pick status. This requirement, in addition to anonymization of images and " +
            "distribution to only a subset of them, prevents biases and ensures that the best images are " +
            "selected.", {
              0: backendConfig.IOTD_SUBMISSION_MIN_PROMOTIONS
            }
          ),
          "votes": this.translateService.instant(
            "When {{ 0 }} distinct Reviewers promote the image, it moves on to the next stage of the process: " +
            "evaluation for IOTD status.", {
              0: backendConfig.IOTD_REVIEW_MIN_PROMOTIONS
            }
          ),
          "early_dismissal": this.translateService.instant(
            "Staff members have a lot of images to inspect on a daily basis, and they can dismiss images if " +
            "they believe they don't meet the requirements for IOTD/TP selection. If an image is dismissed {{ 0 }} " +
            "times, it's removed from the process. This streamlines the process and ensures that any bias " +
            "present in promotions could be overruled by other staff members.", {
              0: backendConfig.IOTD_MAX_DISMISSALS
            }
          )
        }
      })
    );
  }
}
