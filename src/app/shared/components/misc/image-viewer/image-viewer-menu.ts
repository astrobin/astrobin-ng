import { Component, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { DownloadLimitationOptions, FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { filter, take } from "rxjs/operators";
import { DeleteImage, DeleteImageFailure, DeleteImageSuccess, UnpublishImage, UnpublishImageSuccess } from "@app/store/actions/image.actions";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageService } from "@shared/services/image/image.service";
import { environment } from "@env/environment";
import { WindowRefService } from "@shared/services/window-ref.service";
import { NgbModalRef, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { TranslateService } from "@ngx-translate/core";
import { ModalService } from "@shared/services/modal.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { Router } from "@angular/router";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { SimplifiedSubscriptionName } from "@shared/types/subscription-name.type";

@Component({
  selector: "astrobin-image-viewer-menu",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <a
        [href]="classicRoutesService.IMAGE(image.hash || image.pk.toString())"
        [class]="itemClass"
      >
        {{ "Classic view" | translate }}
      </a>

      <ng-container *ngIf="currentUserWrapper.user?.id === image.user">
        <div [class]="dividerClass"></div>

        <a
          [routerLink]="['/i', image.hash || image.pk.toString(), 'edit']"
          [class]="itemClass"
        >
          {{ "Edit" | translate }}
        </a>

        <a
          [routerLink]="['/uploader/revision', image.hash || image.pk.toString()]"
          [class]="itemClass"
        >
          {{ "Upload new revision" | translate }}
        </a>

        <a
          (click)="uploadCompressedSourceClicked()"
          [class]="itemClass"
          astrobinEventPreventDefault
          href="#"
        >
          <ng-container *ngIf="image.uncompressedSourceFile">
            {{ "Replace/delete uncompressed source file" | translate }}
          </ng-container>
          <ng-container *ngIf="!image.uncompressedSourceFile">
            {{ "Upload uncompressed source (XISF/FITS/PSD/TIFF)" | translate }}
          </ng-container>
        </a>

        <a
          *ngIf="!image.isWip"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          (click)="unpublish()"
          [class]="itemClass"
        >
          {{ "Move to staging area" | translate }}
        </a>

        <a
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          (click)="delete()"
          [class]="itemClass + ' text-danger'"
        >
          {{ "Delete" | translate }}
        </a>
      </ng-container>

      <ng-container
        *ngIf="
          currentUserWrapper.user?.id === image.user ||
          image.downloadLimitation === DownloadLimitationOptions.EVERYBODY"
      >
        <div [class]="dividerClass"></div>

        <a
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          (click)="openDownloadOffcanvas()"
          [class]="itemClass"
        >
          {{ "Download" | translate }}
        </a>
      </ng-container>

      <ng-container *ngIf="image.link || image.linkToFits">
        <div [class]="dividerClass"></div>

        <a
          *ngIf="image.link"
          [href]="image.link"
          [class]="itemClass"
        >
          {{ "External link" | translate }}
        </a>

        <a
          *ngIf="image.linkToFits"
          [href]="image.linkToFits"
          [class]="itemClass"
        >
          {{ "External link to FITS" | translate }}
        </a>
      </ng-container>
    </ng-container>

    <ng-template #downloadOffcanvasTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Download" | translate }}</h5>
        <button type="button" class="btn-close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body">
        <a
          (click)="downloadImage(ImageAlias.REGULAR)"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          class="menu-item"
        >
          {{ "Medium" | translate }}
        </a>

        <a
          (click)="downloadImage(ImageAlias.HD)"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          class="menu-item"
        >
          {{ "Large" | translate }}
        </a>

        <a
          (click)="downloadImage(ImageAlias.QHD)"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          class="menu-item"
        >
          {{ "Extra large" | translate }}
        </a>

        <a
          (click)="downloadImage(ImageAlias.REAL)"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          class="menu-item"
        >
          {{ "Full size" | translate }}
        </a>

        <div class="menu-divider"></div>

        <ng-container *ngIf="revision.solution?.imageFile || revision.solution?.pixinsightSvgAnnotationHd">
          <a
            *ngIf="revision.solution.imageFile"
            (click)="downloadImage('basic_annotations')"
            astrobinEventPreventDefault
            astrobinEventStopPropagation
            class="menu-item"
          >
            {{ "Annotations" | translate }}
          </a>

          <a
            *ngIf="revision.solution.pixinsightSvgAnnotationHd"
            (click)="downloadImage('advanced_annotations')"
            astrobinEventPreventDefault
            astrobinEventStopPropagation
            class="menu-item"
          >
            {{ "Advanced annotations" | translate }}
          </a>
        </ng-container>

        <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
          <a
            *ngIf="image.user === currentUserWrapper.user?.id"
            (click)="downloadImage('original')"
            astrobinEventPreventDefault
            astrobinEventStopPropagation
            class="menu-item"
          >
            <fa-icon icon="lock" class="me-2"></fa-icon>
            {{ "Original" | translate }}
          </a>

          <a
            [href]="image.uncompressedSourceFile"
            class="menu-item no-external-link-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <fa-icon icon="lock" class="me-2"></fa-icon>
            {{ "Uncompressed source file" | translate }}
          </a>
        </ng-container>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        overflow-y: auto;
        gap: 1px;
      }
    `
  ]
})
export class ImageViewerMenuComponent extends BaseComponentDirective implements OnChanges {
  @Input() image: ImageInterface;
  @Input() revisionLabel: string = FINAL_REVISION_LABEL;
  @Input() itemClass: string;
  @Input() dividerClass: string;

  @ViewChild("downloadOffcanvasTemplate") downloadOffcanvasTemplate: TemplateRef<any>;

  protected revision: ImageInterface | ImageRevisionInterface;
  protected readonly DownloadLimitationOptions = DownloadLimitationOptions;
  protected readonly ImageAlias = ImageAlias;

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
    public readonly router: Router
  ) {
    super(store$);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.image || changes.revisionLabel) {
      if (this.image && this.revisionLabel) {
        this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
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
        panelClass: "offcanvas-menu",
        position: this.deviceService.mdMax() ? "start" : "end"
      }
    );
  }

  downloadImage(version: ImageAlias | "original" | "basic_annotations" | "advanced_annotations") {
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
}
