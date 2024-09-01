import { Component, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { DownloadLimitationOptions, FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { filter, take } from "rxjs/operators";
import { UnpublishImage, UnpublishImageSuccess } from "@app/store/actions/image.actions";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageService } from "@shared/services/image/image.service";
import { environment } from "@env/environment";
import { WindowRefService } from "@shared/services/window-ref.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";

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
          *ngIf="!image.isWip"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          (click)="unpublish()"
          [class]="itemClass"
        >
          {{ "Move to staging area" | translate }}
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
            <fa-icon icon="lock"></fa-icon>
            {{ "Original" | translate }}
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

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly imageService: ImageService,
    public readonly windowRefService: WindowRefService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService
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

  openDownloadOffcanvas() {
    this.offcanvasService.dismiss(); // Avoids nested offcanvases.
    this.offcanvasService.open(
      this.downloadOffcanvasTemplate, {
        panelClass: "offcanvas-menu",
        position: this.deviceService.mdMax() ? "start" : "end"
      }
    );
  }

  downloadImage(version: ImageAlias | 'original' | 'basic_annotations' | 'advanced_annotations') {
    const url = `${environment.classicBaseUrl}/download/${this.image.hash || this.image.pk}/${this.revisionLabel}/${version}/`;
    this.windowRefService.nativeWindow.open(url, "_blank");
  }

  protected readonly DownloadLimitationOptions = DownloadLimitationOptions;
  protected readonly ImageAlias = ImageAlias;
}
