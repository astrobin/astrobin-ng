import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { select, Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { DownloadLimitationOptions, ImageInterface, ImageRevisionInterface, ORIGINAL_REVISION_LABEL } from "@core/interfaces/image.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { filter, take, takeUntil } from "rxjs/operators";
import { DeleteImage, DeleteImageFailure, DeleteImageSuccess, SubmitImageForIotdTpConsideration, SubmitImageForIotdTpConsiderationSuccess, UnpublishImage, UnpublishImageSuccess } from "@app/store/actions/image.actions";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { ImageService } from "@core/services/image/image.service";
import { environment } from "@env/environment";
import { WindowRefService } from "@core/services/window-ref.service";
import { NgbModalRef, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@core/services/device.service";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { TranslateService } from "@ngx-translate/core";
import { ModalService } from "@core/services/modal.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { Router } from "@angular/router";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { SimplifiedSubscriptionName } from "@core/types/subscription-name.type";
import { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ActiveToast } from "ngx-toastr";
import { LoadingService } from "@core/services/loading.service";
import { Subscription } from "rxjs";
import { selectImage } from "@app/store/selectors/app/image.selectors";

@Component({
  selector: "astrobin-image-viewer-menu",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <ul class="nav flex-column">
      <ng-container *ngIf="currentUserWrapper.user?.id === image.user">
        <li class="nav-item">
          <a
            (click)="imageService.navigateToEdit(image)"
            astrobinEventPreventDefault
            class="nav-link"
          >
            <fa-icon icon="edit"></fa-icon>
            <span class="menu-text">{{ "Edit project" | translate }}</span>
          </a>
        </li>

        <li class="nav-item" *ngIf="revision.label">
          <a
            [routerLink]="['/i', image.hash || image.pk.toString(), revisionLabel, 'edit']"
            class="nav-link"
          >
            <fa-icon icon="pencil-alt"></fa-icon>
            <span class="menu-text">{{ "Edit revision" | translate }}</span>
            <span class="badge rounded-pill bg-light border border-dark fw-bold text-dark ms-2">
              {{ revision.label }}
            </span>
          </a>
        </li>

        <li class="nav-item" *ngIf="image.solution">
          <a
            [routerLink]="['/i', image.hash || image.pk.toString(), 'plate-solving-settings']"
            [queryParams]="{ r: revisionLabel }"
            class="nav-link"
          >
            <fa-icon icon="map"></fa-icon>
            <span class="menu-text">{{ "Edit plate-solving settings" | translate }}</span>
            <span class="badge rounded-pill bg-light border border-dark fw-bold text-dark ms-2" *ngIf="revision.label">
              {{ "Revision" | translate }}: {{ revision.label }}
            </span>
          </a>
        </li>

        <li class="nav-item">
          <a
            [routerLink]="['/uploader/revision', image.hash || image.pk.toString()]"
            class="nav-link"
          >
            <fa-icon icon="upload"></fa-icon>
            <span class="menu-text">{{ "Upload new revision" | translate }}</span>
          </a>
        </li>

        <li class="nav-item">
          <a
            (click)="uploadCompressedSourceClicked()"
            class="nav-link"
            astrobinEventPreventDefault
            href="#"
          >
            <fa-icon icon="file"></fa-icon>
            <span class="menu-text">
              <ng-container *ngIf="image.uncompressedSourceFile">
                {{ "Replace/delete uncompressed source file" | translate }}
              </ng-container>
              <ng-container *ngIf="!image.uncompressedSourceFile">
                {{ "Upload uncompressed source (XISF/FITS/PSD/TIFF)" | translate }}
              </ng-container>
            </span>
          </a>
        </li>

        <li class="nav-item" *ngIf="!image.isWip">
          <a
            astrobinEventPreventDefault
            astrobinEventStopPropagation
            (click)="unpublish()"
            class="nav-link"
            href="#"
          >
            <fa-icon icon="lock"></fa-icon>
            <span class="menu-text">{{ "Move to staging area" | translate }}</span>
          </a>
        </li>

        <li class="nav-item" *ngIf="!image.submittedForIotdTpConsideration">
          <a
            (click)="openSubmitForIotdTpConsiderationOffcanvas()"
            class="nav-link"
            astrobinEventPreventDefault
            astrobinEventStopPropagation
            href="#"
          >
            <fa-icon icon="arrow-up"></fa-icon>
            <span class="menu-text">
              {{ "Submit for IOTD/TP consideration" | translate }}
              <small *ngIf="image.published" class="d-block text-muted">
                {{ "Deadline" }}: {{ image.published | addDays: 30 | utcToLocal | date: "short" }}
              </small>
            </span>
          </a>
        </li>

        <li class="nav-item" *ngIf="image.submittedForIotdTpConsideration">
          <a
            (click)="viewIotdTpStats()"
            class="nav-link"
            astrobinEventPreventDefault
            astrobinEventStopPropagation
            href="#"
          >
            <fa-icon icon="chart-bar"></fa-icon>
            <span class="menu-text">
              {{ "View IOTD/TP stats" | translate }}
              <small class="d-block text-muted">
                {{ "Submitted" }}: {{ image.submittedForIotdTpConsideration | localDate | date: "short" }}
              </small>
            </span>
          </a>
        </li>

        <li class="nav-item">
          <a
            astrobinEventPreventDefault
            astrobinEventStopPropagation
            (click)="delete()"
            class="nav-link text-danger"
            href="#"
          >
            <fa-icon icon="trash"></fa-icon>
            <span class="menu-text">{{ "Delete" | translate }}</span>
          </a>
        </li>
      </ng-container>

      <ng-container
        *ngIf="
          currentUserWrapper.user?.id === image.user ||
          image.downloadLimitation === DownloadLimitationOptions.EVERYBODY"
      >
        <li class="nav-item">
          <hr class="dropdown-divider">
        </li>

        <li class="nav-item">
          <a
            astrobinEventPreventDefault
            astrobinEventStopPropagation
            (click)="openDownloadOffcanvas()"
            class="nav-link"
            href="#"
          >
            <fa-icon icon="download"></fa-icon>
            <span class="menu-text">{{ "Download" | translate }}</span>
          </a>
        </li>
      </ng-container>

      <li class="nav-item">
        <a
          [href]="classicRoutesService.IMAGE(image.hash || image.pk.toString()) + '?force-classic-view'"
          class="nav-link"
        >
          <fa-icon icon="eye"></fa-icon>
          <span class="menu-text">{{ "Classic view" | translate }}</span>
        </a>
      </li>
    </ul>
    </ng-container>

    <ng-template #downloadOffcanvasTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Download" | translate }}</h5>
        <button type="button" class="btn-close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body">
        <ul class="nav flex-column">
          <li class="nav-item">
            <a
              (click)="downloadImage(ImageAlias.REGULAR)"
              astrobinEventPreventDefault
              astrobinEventStopPropagation
              class="nav-link"
            >
              <fa-icon icon="file-image"></fa-icon>
              <span class="menu-text">{{ "Medium" | translate }}</span>
            </a>
          </li>

          <li class="nav-item">
            <a
              (click)="downloadImage(ImageAlias.HD)"
              astrobinEventPreventDefault
              astrobinEventStopPropagation
              class="nav-link"
            >
              <fa-icon icon="file-image"></fa-icon>
              <span class="menu-text">{{ "Large" | translate }}</span>
            </a>
          </li>

          <li class="nav-item">
            <a
              (click)="downloadImage(ImageAlias.QHD)"
              astrobinEventPreventDefault
              astrobinEventStopPropagation
              class="nav-link"
            >
              <fa-icon icon="file-image"></fa-icon>
              <span class="menu-text">{{ "Extra large" | translate }}</span>
            </a>
          </li>

          <li class="nav-item">
            <a
              (click)="downloadImage(ImageAlias.REAL)"
              astrobinEventPreventDefault
              astrobinEventStopPropagation
              class="nav-link"
            >
              <fa-icon icon="file-image"></fa-icon>
              <span class="menu-text">{{ "Full size" | translate }}</span>
            </a>
          </li>

          <li class="nav-item">
            <hr class="dropdown-divider">
          </li>

          <ng-container *ngIf="revision.solution?.imageFile || revision.solution?.pixinsightSvgAnnotationHd">
            <li class="nav-item" *ngIf="revision.solution.imageFile">
              <a
                (click)="downloadImage('basic_annotations')"
                astrobinEventPreventDefault
                astrobinEventStopPropagation
                class="nav-link"
              >
                <fa-icon icon="map-marked-alt"></fa-icon>
                <span class="menu-text">{{ "Annotations" | translate }}</span>
              </a>
            </li>

            <li class="nav-item" *ngIf="revision.solution.pixinsightSvgAnnotationHd">
              <a
                (click)="downloadImage('advanced_annotations')"
                astrobinEventPreventDefault
                astrobinEventStopPropagation
                class="nav-link"
              >
                <fa-icon icon="map-marked-alt"></fa-icon>
                <span class="menu-text">{{ "Advanced annotations" | translate }}</span>
              </a>
            </li>

            <li class="nav-item" *ngIf="revision.solution.pixinsightSvgAnnotationRegular">
              <a
                (click)="downloadImage('advanced_annotations_large_font')"
                astrobinEventPreventDefault
                astrobinEventStopPropagation
                class="nav-link"
              >
                <fa-icon icon="map-marked-alt"></fa-icon>
                <span class="menu-text">{{ "Advanced annotations (large font)" | translate }}</span>
              </a>
            </li>
          </ng-container>

          <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
            <li class="nav-item" *ngIf="image.user === currentUserWrapper.user?.id">
              <a
                (click)="downloadImage('original')"
                astrobinEventPreventDefault
                astrobinEventStopPropagation
                class="nav-link"
              >
                <fa-icon icon="lock"></fa-icon>
                <span class="menu-text">{{ "Original" | translate }}</span>
              </a>
            </li>

            <li class="nav-item" *ngIf="image.uncompressedSourceFile">
              <a
                [href]="image.uncompressedSourceFile"
                class="nav-link no-external-link-icon"
                target="_blank"
                rel="noopener noreferrer"
              >
                <fa-icon icon="lock"></fa-icon>
                <span class="menu-text">{{ "Uncompressed source file" | translate }}</span>
              </a>
            </li>
          </ng-container>
        </ul>
      </div>
    </ng-template>

    <ng-template #submitForIotdTpConsiderationOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">
          <ng-container *ngIf="maySubmitForIotdTpConsideration === undefined">
            {{ "Loading..." | translate }}
          </ng-container>
          <ng-container *ngIf="maySubmitForIotdTpConsideration === true">
            {{ "Submit for IOTD/TP consideration" | translate }}
          </ng-container>
          <ng-container *ngIf="maySubmitForIotdTpConsideration === false">
            {{ "Error!" | translate }}
          </ng-container>
        </h5>
        <button type="button" class="btn-close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body">
        <ng-container *ngIf="maySubmitForIotdTpConsideration === true">
          <p class="alert alert-dark">
            {{
              "The “AstroBin Image of the Day and Top Picks” is a long-running system to promote beautiful, " +
              "interesting, peculiar, or otherwise amazing astrophotographs, with a focus on technical " +
              "excellence." | translate
            }}
          </p>

          <form [formGroup]="submitForIotdTpConsiderationForm" (ngSubmit)="submitForIotdTpConsideration()">
            <formly-form
              [model]="submitForIotdTpConsiderationModel"
              [fields]="submitForIotdTpConsiderationFields"
            ></formly-form>

            <div class="form-actions">
              <button
                [class.loading]="loadingService.loading$ | async"
                class="btn btn-primary w-100"
                type="submit"
              >
                {{ "Submit" | translate }}
              </button>
            </div>
          </form>
        </ng-container>

        <ng-container *ngIf="maySubmitForIotdTpConsideration === false">
          <p>
            <fa-icon icon="exclamation-triangle" class="me-2"></fa-icon>
            <span [innerHTML]="reasonIfCannotSubmitForIotdTpConsideration"></span>
          </p>
        </ng-container>

        <ng-container
          *ngIf="maySubmitForIotdTpConsideration === undefined"
          [ngTemplateOutlet]="loadingTemplate"
        >
        </ng-container>
      </div>
    </ng-template>

    <ng-template #viewIotdTpStatsOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">
          {{ "IOTD/TP stats" | translate }}
          <fa-icon icon="lock" class="ms-2"></fa-icon>
        </h5>
        <button type="button" class="btn-close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body">
        <astrobin-image-viewer-iotd-tp-stats
          [image]="image"
        ></astrobin-image-viewer-iotd-tp-stats>
      </div>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-menu.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerMenuComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() image: ImageInterface;
  @Input() revisionLabel: string;
  @Input() itemClass: string;
  @Input() dividerClass: string;

  @ViewChild("downloadOffcanvasTemplate") downloadOffcanvasTemplate: TemplateRef<any>;
  @ViewChild("submitForIotdTpConsiderationOffcanvas") submitForIotdTpConsiderationOffcanvas: TemplateRef<any>;
  @ViewChild("viewIotdTpStatsOffcanvas") viewIotdTpStatsOffcanvas: TemplateRef<any>;

  protected readonly DownloadLimitationOptions = DownloadLimitationOptions;
  protected readonly ImageAlias = ImageAlias;
  protected readonly ORIGINAL_REVISION_LABEL = ORIGINAL_REVISION_LABEL;

  protected readonly submitForIotdTpConsiderationForm = new FormGroup({});
  protected readonly submitForIotdTpConsiderationModel: {
    agreedToIotdTpRulesAndGuidelines: boolean
  } = {
    agreedToIotdTpRulesAndGuidelines: false
  };
  protected readonly submitForIotdTpConsiderationFields: FormlyFieldConfig[] = [
    {
      key: "agreedToIotdTpRulesAndGuidelines",
      type: "checkbox",
      wrappers: ["default-wrapper"],
      props: {
        label: this.translateService.instant("I agree to the IOTD/TP rules and guidelines"),
        description: this.translateService.instant(
          "By submitting your image for consideration, you agree to the IOTD/TP " +
          "{{ 0 }}rules{{ 1 }} and {{ 2 }}guidelines.{{ 3 }}", {
            0: "<a href='https://welcome.astrobin.com/iotd#rules' target='_blank' rel='noopener'>",
            1: "</a>",
            2: "<a href='https://welcome.astrobin.com/iotd#photographer-guidelines' target='_blank' rel='noopener'>",
            3: "</a>"
          }
        ),
        required: true
      }
    }
  ];

  protected revision: ImageInterface | ImageRevisionInterface;
  protected maySubmitForIotdTpConsideration: boolean;
  protected reasonIfCannotSubmitForIotdTpConsideration: string;

  private _agreedToIotdTpRulesAndGuidelinesNotification: ActiveToast<any>;
  private _selectImageSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly imageService: ImageService,
    public readonly windowRefService: WindowRefService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly modalService: ModalService,
    public readonly translateService: TranslateService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly router: Router,
    public readonly imageApiService: ImageApiService,
    public readonly loadingService: LoadingService,
    public readonly changeDetectionRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this._initSubmitForIotdTpConsiderationForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.image || changes.revisionLabel) {
      if (this.image && this.revisionLabel) {
        this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
      }

      if (changes.image) {
        if (this._selectImageSubscription) {
          this._selectImageSubscription.unsubscribe();
        }

        this._selectImageSubscription = this.store$.pipe(
          select(selectImage, this.image.pk),
          filter(image => !!image),
          takeUntil(this.destroyed$)
        ).subscribe(image => {
          this.image = image;
          this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
          this.changeDetectionRef.markForCheck();
        });
      }
    }
  }

  unpublish() {
    this.actions$.pipe(
      ofType(AppActionTypes.UNPUBLISH_IMAGE_SUCCESS),
      filter((action: UnpublishImageSuccess) => action.payload.pk === this.image.pk),
      take(1)
    ).subscribe(() => {
      this.popNotificationsService.success("Image moved to your staging area.");
    });

    this.store$.dispatch(new UnpublishImage({ pk: this.image.pk }));
  }

  delete() {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
    const instance: ConfirmationDialogComponent = modalRef.componentInstance;

    instance.message = this.translateService.instant(
      "Your image will be deleted along with all revisions and metadata."
    );

    modalRef.closed.subscribe(() => {
      const loadingModalRef: NgbModalRef = this.modalService.openLoadingDialog();

      this.actions$.pipe(
        ofType(AppActionTypes.DELETE_IMAGE_SUCCESS, AppActionTypes.DELETE_IMAGE_FAILURE), // Listen for both success and failure
        filter((action: DeleteImageSuccess | DeleteImageFailure) => action.payload.pk === this.image.pk),
        take(1)
      ).subscribe(() => {
        loadingModalRef.close();
      });

      this.store$.dispatch(new DeleteImage({ pk: this.image.pk }));
    });
  }

  openDownloadOffcanvas() {
    this.offcanvasService.dismiss(); // Avoids nested offcanvases.
    this.offcanvasService.open(
      this.downloadOffcanvasTemplate, {
        panelClass: "image-viewer-offcanvas offcanvas-menu",
        backdropClass: "image-viewer-offcanvas-backdrop",
        position: this.deviceService.mdMax() ? "start" : "end"
      }
    );
  }

  downloadImage(
    version: ImageAlias | "original" | "basic_annotations" | "advanced_annotations" | "advanced_annotations_large_font"
  ) {
    const url = `${environment.classicBaseUrl}/download/${this.image.hash || this.image.pk}/${this.revisionLabel}/${version}/`;
    this.windowRefService.nativeWindow.open(url, "_blank");
  }

  uploadCompressedSourceClicked() {
    this.userSubscriptionService.isUltimate$().pipe(take(1)).subscribe(isUltimate => {
      if (isUltimate) {
        this.router.navigate(["/uploader/uncompressed-source", this.image.hash || this.image.pk.toString()]);
      } else {
        const modalRef = this.modalService.open(SubscriptionRequiredModalComponent);
        modalRef.componentInstance.minimumSubscription = SimplifiedSubscriptionName.ASTROBIN_ULTIMATE_2020;
      }
    });
  }

  openSubmitForIotdTpConsiderationOffcanvas() {
    this.offcanvasService.dismiss(); // Avoids nested offcanvases.
    this.offcanvasService.open(this.submitForIotdTpConsiderationOffcanvas, {
      panelClass: "image-viewer-offcanvas",
      backdropClass: "image-viewer-offcanvas-backdrop",
      position: this.deviceService.offcanvasPosition()
    });

    this.imageApiService.maySubmitForIotdTpConsideration(this.image.pk).subscribe(response => {
      this.maySubmitForIotdTpConsideration = response.may;
      this.reasonIfCannotSubmitForIotdTpConsideration = response.humanizedReason;
    });
  }

  submitForIotdTpConsideration() {
    if (!this.submitForIotdTpConsiderationModel.agreedToIotdTpRulesAndGuidelines) {
      this._agreedToIotdTpRulesAndGuidelinesNotification = this.popNotificationsService.error(
        this.translateService.instant("Please agree to the IOTD/TP rules and guidelines.")
      );
      return;
    }

    if (this._agreedToIotdTpRulesAndGuidelinesNotification) {
      this.popNotificationsService.remove(this._agreedToIotdTpRulesAndGuidelinesNotification.toastId);
      this._agreedToIotdTpRulesAndGuidelinesNotification = undefined;
    }

    this.actions$.pipe(
      ofType(AppActionTypes.SUBMIT_IMAGE_FOR_IOTD_TP_CONSIDERATION_SUCCESS),
      filter((action: SubmitImageForIotdTpConsiderationSuccess) => action.payload.image.pk === this.image.pk),
      take(1)
    ).subscribe(() => {
      this.offcanvasService.dismiss();
    });

    this.store$.dispatch(new SubmitImageForIotdTpConsideration({ pk: this.image.pk }));
  }

  viewIotdTpStats() {
    this.offcanvasService.dismiss(); // Avoids nested offcanvases.
    this.offcanvasService.open(this.viewIotdTpStatsOffcanvas, {
      panelClass: "image-viewer-offcanvas image-iotd-tp-stats-offcanvas",
      backdropClass: "image-viewer-offcanvas-backdrop",
      position: this.deviceService.offcanvasPosition()
    });
  }

  private _initSubmitForIotdTpConsiderationForm(): void {
    this.currentUserProfile$.pipe(take(1)).subscribe(currentUserProfile => {
      this.submitForIotdTpConsiderationModel.agreedToIotdTpRulesAndGuidelines = currentUserProfile?.agreedToIotdTpRulesAndGuidelines;
    });
  }
}
