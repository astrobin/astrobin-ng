import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Inject, OnChanges, OnInit, PLATFORM_ID, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
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
import { isPlatformBrowser } from "@angular/common";
import { LoadImage } from "@app/store/actions/image.actions";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";

@Component({
  selector: "astrobin-image-viewer-plate-solving-banner",
  template: `
    <div
      class="image-viewer-banner alert alert-dark d-flex align-items-center gap-2"
    >
      <div class="flex-grow-1">
        <fa-icon icon="spinner" animation="spin" class="me-2"></fa-icon>

        <span *ngIf="!solution">
          {{ "AstroBin is preparing to plate-solve this image..." | translate }}
        </span>

        <span *ngIf="!!solution && solution.status === SolutionStatus.PENDING">
          {{ "AstroBin is plate-solving this image with Astrometry.net..." | translate }}
        </span>

        <span *ngIf="!!solution && solution.status === SolutionStatus.ADVANCED_PENDING">
          {{ "AstroBin is plate-solving this image with PixInsight..." | translate }}
        </span>
      </div>

      <button class="btn btn-link btn-no-block" (click)="openInformationOffcanvas()">
        <fa-icon icon="info-circle" class="me-0"></fa-icon>
      </button>
    </div>

    <ng-template #informationOffcanvasTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">
          {{ "Plate-solving information" | translate }}
        </h5>
        <button type="button" class="btn-close" (click)="offcanvas.close()"></button>
      </div>
      <div class="offcanvas-body">
        <p>Astrometry.net job ID:
          <a
            *ngIf="solution.submissionId; else naTemplate"
            [href]="'https://nova.astrometry.net/status/' + solution.submissionId"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ solution.submissionId }}
          </a>
        </p>

        <p>
          PixInsight job ID:
          <span
            *ngIf="solution.pixinsightSerialNumber; else naTemplate"
          >
            {{ solution.pixinsightSerialNumber}}
          </span>
        </p>

        <p *ngIf="solution.pixinsightQueueSize">
          {{ "PixInsight queue size" | translate }}: {{ solution.pixinsightSerialNumber}}
        </p>

        <p *ngIf="solution.pixinsightStage">
          {{ "PixInsight stage" | translate }}: {{ solution.pixinsightStage}}
        </p>
      </div>
    </ng-template>

    <ng-template #naTemplate>
      {{ "n/a" | translate }}
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerPlateSolvingBannerComponent
  extends ImageViewerSectionBaseComponent implements OnInit, OnChanges {
  protected solution: SolutionInterface;
  protected revision: ImageInterface | ImageRevisionInterface;
  protected readonly SolutionStatus = SolutionStatus;

  @ViewChild("informationOffcanvasTemplate")
  private _informationOffcanvasTemplate: TemplateRef<any>;

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
    public readonly userSubscriptionService: UserSubscriptionService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly imageApiService: ImageApiService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);
  }

  ngOnInit() {
    super.ngOnInit();

    if (isPlatformBrowser(this.platformId)) {
      this.userSubscriptionService.canPlateSolveAdvanced$().subscribe(canPlateSolveAdvanced => {
        this._performAdvancedSolve = canPlateSolveAdvanced;
        this._pollSolution();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue || changes.revisionLabel && changes.revisionLabel.currentValue) {
      this._initImage(this.image);
    }
  }

  private _initImage(image: ImageInterface) {
    this.revision = this.imageService.getRevision(image, this.revisionLabel);
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

  protected openInformationOffcanvas() {
    if (!this.solution) {
      this.popNotificationsService.error(this.translateService.instant("No plate-solving information available."));
      return;
    }

    this.offcanvasService.open(this._informationOffcanvasTemplate, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  _solutionSucceeded(): boolean {
    if (!this.solution) {
      return false;
    }

    return this._previouslySolving &&
      (
        this.solution.status === SolutionStatus.SUCCESS ||
        this.solution.status === SolutionStatus.ADVANCED_SUCCESS
      );
  }

  _solutionFailed(): boolean {
    if (!this.solution) {
      return false;
    }

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
      this.imageApiService.getImage(this.image.pk).subscribe(image => {
        this.image = image;
        this._initImage(image);
        this.changeDetectorRef.markForCheck();
      });
      return;
    }

    const payload = {
      contentType: this.solution.contentType,
      objectId: this.solution.objectId,
      forceRefresh: true
    };

    this.store$.dispatch(new LoadSolution(payload));

    if (this._isSolving) {
      this._pollingSubscription = this.utilsService.delay(30000).subscribe(() => {
        this._pollSolution();
        this.changeDetectorRef.markForCheck();
      });
    }
  }
}
