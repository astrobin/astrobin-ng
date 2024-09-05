import { Component, HostBinding, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { SolutionInterface, SolutionStatus } from "@shared/interfaces/solution.interface";
import { SolutionService } from "@shared/services/solution/solution.service";
import { LoadSolution } from "@app/store/actions/solution.actions";
import { UtilsService } from "@shared/services/utils/utils.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { Subscription } from "rxjs";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";

@Component({
  selector: "astrobin-image-viewer-plate-solving-banner",
  template: `
    <div
      class="image-viewer-banner alert alert-dark d-flex align-items-center gap-2"
    >
      <fa-icon icon="spinner" animation="spin"></fa-icon>
      <span *ngIf="solution.status < SolutionStatus.SUCCESS; else solvingWithPixInsightTemplate">
        {{ "AstroBin is plate-solving this image with Astrometry.net..." | translate }}
      </span>
    </div>

    <ng-template #solvingWithPixInsightTemplate>
      <span>
        {{ "AstroBin is plate-solving this image with PixInsight..." | translate }}
      </span>
    </ng-template>
  `
})
export class ImageViewerPlateSolvingBannerComponent
  extends ImageViewerSectionBaseComponent implements OnInit, OnChanges {
  protected solution: SolutionInterface;
  protected revision: ImageInterface | ImageRevisionInterface;
  protected readonly SolutionStatus = SolutionStatus;

  // Used to determine if the banner should be shown. If the solution is successful or failed, the banner should be
  @HostBinding("class")
  private _hostClass = "d-none";

  private _previouslySolving = false;
  private _isSolving = false;
  private _pollingSubscription: Subscription;
  private _performAdvancedSolve = false;
  private readonly _successMessage = this.translateService.instant("Image successfully plate-solved.");
  private readonly _failureMessage = this.translateService.instant("Image plate-solving failed.");

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly imageService: ImageService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly solutionService: SolutionService,
    public readonly utilsService: UtilsService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly userSubscriptionService: UserSubscriptionService
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);
  }

  ngOnInit() {
    super.ngOnInit();

    this.userSubscriptionService.canPlateSolveAdvanced$().subscribe(canPlateSolveAdvanced => {
      this._performAdvancedSolve = canPlateSolveAdvanced;
      this._pollSolution();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue || changes.revisionLabel && changes.revisionLabel.currentValue) {
      this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
      if (this.revision) {
        this.solution = this.revision.solution;
        this._isSolving = this.solutionService.isSolving(this.solution);
        this._hostClass = this._isSolving ? "" : "d-none";

        if (this._isSolving) {
          this._previouslySolving = true;
        }

        if (this._solutionSucceeded()) {
          if (this.solution.status !== SolutionStatus.ADVANCED_SUCCESS && !this._performAdvancedSolve) {
            this.popNotificationsService.success(this._successMessage);
            this._cancelPolling();
          }
        } else if (this._solutionFailed()) {
          this.popNotificationsService.error(this._failureMessage);
          this._cancelPolling();
        }
      }
    }
  }

  _solutionSucceeded(): boolean {
    return this._previouslySolving &&
      (
        this.solution.status === SolutionStatus.SUCCESS ||
        this.solution.status === SolutionStatus.ADVANCED_SUCCESS
      );
  }

  _solutionFailed(): boolean {
    return this._previouslySolving &&
      (
        this.solution.status === SolutionStatus.FAILED ||
        this.solution.status === SolutionStatus.ADVANCED_FAILED
      );
  }

  _cancelPolling() {
    if (this._pollingSubscription) {
      this._pollingSubscription.unsubscribe();
      this._pollingSubscription = null;
    }
  }

  _pollSolution() {
    if (!this.solution) {
      return;
    }

    const payload = {
      contentType: this.solution.contentType,
      objectId: this.solution.objectId,
      forceRefresh: true
    };

    this.store$.dispatch(new LoadSolution(payload));

    if (this._isSolving) {
      this._pollingSubscription = this.utilsService.delay(30000).subscribe(() => this._pollSolution());
    }
  }
}
