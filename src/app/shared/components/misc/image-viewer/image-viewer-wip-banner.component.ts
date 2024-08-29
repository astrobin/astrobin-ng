import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { PublishImage, PublishImageSuccess } from "@app/store/actions/image.actions";
import { DeviceService } from "@shared/services/device.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@shared/services/loading.service";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { filter, take } from "rxjs/operators";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

@Component({
  selector: "astrobin-image-viewer-wip-banner",
  template: `
    <div
      class="image-viewer-banner alert alert-warning d-flex justify-content-between align-items-center gap-2"
    >
      <div>
        <fa-icon icon="info-circle"></fa-icon>
        {{ "This image is in your staging area." | translate }}
        <a href="" target="_blank">{{ "Learn more" | translate }}.</a>
      </div>
      <button
        (click)="openPromoteOffcanvas()"
        class="btn btn-primary btn-no-block"
      >
        {{ "Publish" | translate }}
      </button>
    </div>

    <ng-template #promoteOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Publish image" | translate }}</h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          (click)="offcanvas.close()"
        ></button>
      </div>
      <div class="offcanvas-body">
        <form [formGroup]="form">
          <formly-form [form]="form" [fields]="fields" [model]="model"></formly-form>
        </form>

        <button
          (click)="publish()"
          class="btn btn-primary mt-5"
          [class.loading]="loadingService.loading$ | async"
        >
          {{ "Publish" | translate }}
        </button>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .image-viewer-banner {
        font-size: .9rem;
      }
    `
  ]
})
export class ImageViewerWipBannerComponent extends ImageViewerSectionBaseComponent implements OnInit {
  readonly model = {
    skipNotifications: false,
    skipActivityStream: false
  };
  readonly form = new FormGroup({});
  readonly fields = [
    {
      key: "skipNotifications",
      type: "checkbox",
      wrappers: ["default-wrapper"],
      props: {
        label: this.translateService.instant("Skip notifications"),
        description: this.translateService.instant("Don't notify followers about this image.")
      }
    },
    {
      key: "skipActivityStream",
      type: "checkbox",
      wrappers: ["default-wrapper"],
      props: {
        label: this.translateService.instant("Skip activity stream"),
        description: this.translateService.instant("Do not create an entry on the front page's activity stream for this event.")
      }
    }
  ];

  @ViewChild("promoteOffcanvas") promoteOffcanvas: TemplateRef<any>;

  public constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService,
    public readonly actions$: Actions,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);
  }

  public ngOnInit(): void {
    super.ngOnInit();
  }

  openPromoteOffcanvas() {
    this.offcanvasService.open(this.promoteOffcanvas, { position: this.deviceService.offcanvasPosition() });
  }

  publish() {
    this.actions$.pipe(
      ofType(AppActionTypes.PUBLISH_IMAGE_SUCCESS),
      filter((action: PublishImageSuccess) => action.payload.pk === this.image.pk),
      take(1)
    ).subscribe(() => {
      this.offcanvasService.dismiss();
      this.popNotificationsService.success("Image published successfully.");
    });

    this.store$.dispatch(new PublishImage({
      pk: this.image.pk,
      skipNotifications: this.model.skipNotifications,
      skipActivityStream: this.model.skipActivityStream
    }));
  }
}
