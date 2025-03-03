import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostBinding, Inject, OnChanges, OnInit, Output, PLATFORM_ID, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { ImageService } from "@core/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@core/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@core/services/device.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { SolutionInterface, SolutionStatus } from "@core/interfaces/solution.interface";
import { SolutionService } from "@core/services/solution/solution.service";
import { LoadSolution, LoadSolutionSuccess } from "@app/store/actions/solution.actions";
import { UtilsService } from "@core/services/utils/utils.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { forkJoin, Subscription } from "rxjs";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { isPlatformBrowser } from "@angular/common";
import { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { CookieService } from "ngx-cookie";
import { CollapseSyncService } from "@core/services/collapse-sync.service";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { filter, map, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-image-viewer-plate-solving-banner",
  template: `
    <div
      *ngIf="performSolve"
      class="image-viewer-banner alert alert-dark d-flex align-items-center gap-2"
    >
      <div class="flex-grow-1">
        <fa-icon icon="spinner" animation="spin" class="me-2"></fa-icon>

        <span *ngIf="!solution || !solution.status">
          {{ "AstroBin is preparing to plate-solve this image..." | translate }}
        </span>

        <span *ngIf="!!solution && solution.status === SolutionStatus.PENDING">
          {{ "AstroBin is plate-solving this image with Astrometry.net..." | translate }}
        </span>

        <span *ngIf="
          !!solution &&
          (
            solution.status === SolutionStatus.ADVANCED_PENDING ||
            (solution.status === SolutionStatus.SUCCESS && performAdvancedSolve)
          )
        ">
          {{ "AstroBin is plate-solving this image with PixInsight..." | translate }}
        </span>
      </div>

      <button
        *ngIf="!!solution && (solution.submissionId || solution.pixinsightSerialNumber)"
        (click)="openInformationOffcanvas()"
        class="btn btn-link btn-no-block"
      >
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

        <p *ngIf="solution.pixinsightQueueSize !== null && solution.pixinsightQueueSize !== undefined">
          {{ "PixInsight queue size" | translate }}: {{ +solution.pixinsightQueueSize + 1}}
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
  protected performSolve = false;
  protected performAdvancedSolve = false;
  protected readonly SolutionStatus = SolutionStatus;

  @Output()
  solutionChange = new EventEmitter<SolutionInterface>();

  @ViewChild("informationOffcanvasTemplate")
  private _informationOffcanvasTemplate: TemplateRef<any>;

  // Used to determine if the banner should be shown. If the solution is successful or failed, the banner should be
  @HostBinding("class")
  private _hostClass = "d-none";

  private _previouslySolving = false;
  private _isSolving = false;
  private _pollingSubscription: Subscription;
  private readonly _successMessage = this.translateService.instant("Image successfully plate-solved.");
  private readonly _failureMessage = this.translateService.instant("Image plate-solving with Astrometry.net failed.");
  private readonly _advancedFailureMessage = this.translateService.instant(
    "Image plate-solving with PixInsight failed."
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
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
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly cookieService: CookieService,
    public readonly collapseSyncService: CollapseSyncService
  ) {
    super(
      store$,
      searchService,
      router,
      imageViewerService,
      windowRefService,
      cookieService,
      collapseSyncService,
      changeDetectorRef
    );
  }

  ngOnInit() {
    super.ngOnInit();

    if (isPlatformBrowser(this.platformId)) {
      forkJoin({
        canPlateSolve: this.userSubscriptionService.canPlateSolve$(),
        canPlateSolveAdvanced: this.userSubscriptionService.canPlateSolveAdvanced$()
      }).subscribe(({ canPlateSolve, canPlateSolveAdvanced }) => {
        this.performSolve = canPlateSolve;
        this.performAdvancedSolve = canPlateSolveAdvanced;

        if (this.performSolve) {
          this._pollSolution();
        }

        this.changeDetectorRef.markForCheck();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue || changes.revisionLabel && changes.revisionLabel.currentValue) {
      this._initImage(this.image);
      this._listenForSolutionChanges();
    }
  }

  private _listenForSolutionChanges() {
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_SOLUTION_SUCCESS),
      map((action: LoadSolutionSuccess) => action.payload),
      filter(solution =>
        solution.objectId === this.solution.objectId &&
        solution.contentType === this.solution.contentType
      ),
      takeUntil(this.destroyed$)
    ).subscribe(solution => {
      this.solution = solution;
      this._onSolutionChange();
    });
  }

  private _initImage(image: ImageInterface) {
    this.revision = this.imageService.getRevision(image, this.revisionLabel);
    if (this.revision) {
      this.solution = this.revision.solution;
      this._onSolutionChange();
    }
  }

  private _onSolutionChange() {
    this._isSolving = (
      this.solutionService.isSolving(this.solution) ||
      !this.solution ||
      !this.solution.status ||
      (
        this.solution.status === SolutionStatus.SUCCESS && this.performAdvancedSolve
      )
    );
    this._hostClass = this._isSolving ? "" : "d-none";

    if (this._isSolving) {
      this._previouslySolving = true;
    }

    if (this._solutionSucceeded()) {
      if (this.solution.status !== SolutionStatus.ADVANCED_SUCCESS && !this.performAdvancedSolve) {
        this.popNotificationsService.success(this._successMessage);
        this._cancelPolling();
      }
    } else if (this._solutionFailed()) {
      this.popNotificationsService.error(this._failureMessage);
      this._cancelPolling();
    } else if (this._solutionAdvancedFailed()) {
      this.popNotificationsService.error(this._advancedFailureMessage);
      this._cancelPolling();
    }

    this.solutionChange.emit(this.solution);
  }

  protected openInformationOffcanvas() {
    this.offcanvasService.open(this._informationOffcanvasTemplate, {
      panelClass: "image-viewer-offcanvas",
      backdropClass: "image-viewer-offcanvas-backdrop",
      position: this.deviceService.offcanvasPosition()
    });
  }

  _solutionSucceeded(): boolean {
    if (!this.solution) {
      return false;
    }

    return this._previouslySolving &&
      (
        this.solution.status === SolutionStatus.SUCCESS
      );
  }

  _solutionFailed(): boolean {
    if (!this.solution) {
      return false;
    }

    return this._previouslySolving &&
      (
        this.solution.status === SolutionStatus.FAILED
      );
  }

  _solutionAdvancedFailed(): boolean {
    if (!this.solution) {
      return false;
    }

    return this._previouslySolving &&
      (
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
    // Only proceed if the user can solve
    if (!this.performSolve) {
      return;
    }

    if (!this.solution) {
      this.imageApiService.getImage(this.image.pk).subscribe(image => {
        this.image = image;
        this._initImage(image);
        this.changeDetectorRef.markForCheck();
      });
    } else {
      const payload = {
        contentType: this.solution.contentType,
        objectId: this.solution.objectId,
        forceRefresh: true,
        includePixInsightDetails: true
      };

      this.store$.dispatch(new LoadSolution(payload));
    }

    if (this._isSolving) {
      this._pollingSubscription = this.utilsService.delay(10000).subscribe(() => {
        this._pollSolution();
        this.changeDetectorRef.markForCheck();
      });
    }
  }
}
