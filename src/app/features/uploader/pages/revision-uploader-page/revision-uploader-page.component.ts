import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { MainState } from "@app/store/state";
import { environment } from "@env/environment";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Constants } from "@shared/constants";
import { ImageInterface } from "@core/interfaces/image.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { TitleService } from "@core/services/title/title.service";
import { UploadDataService } from "@core/services/upload-metadata/upload-data.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { UploadState, UploadxService } from "ngx-uploadx";
import { Observable } from "rxjs";
import { filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { SubscriptionName } from "@core/types/subscription-name.type";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { Actions } from "@ngrx/effects";
import { ImageService } from "@core/services/image/image.service";
import { ImageAlias } from "@core/enums/image-alias.enum";

@Component({
  selector: "astrobin-revision-uploader-page",
  templateUrl: "./revision-uploader-page.component.html",
  styleUrls: ["./revision-uploader-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevisionUploaderPageComponent extends BaseComponentDirective implements OnInit {
  SubscriptionName = SubscriptionName;

  form = new FormGroup({});
  uploadState: UploadState;
  pageTitle = this.translate.instant("Revision uploader");

  model = {
    image_file: "",
    skip_notifications: false,
    skip_activity_stream: false,
    mark_as_final: true
  };

  fields: FormlyFieldConfig[] = [
    {
      key: "image_file",
      id: "image_file",
      type: "chunked-file",
      props: {
        required: true,
        endpoint: `${environment.classicApiUrl}/api/v2/images/image-revision-upload/`,
        allowedTypes: Constants.ALLOWED_IMAGE_UPLOAD_EXTENSIONS.join(",") + "," + Constants.ALLOWED_VIDEO_UPLOAD_EXTENSIONS.join(","),
        uploadLabel: this.uploadDataService.getUploadLabel(
          Constants.ALLOWED_IMAGE_UPLOAD_EXTENSIONS.concat(Constants.ALLOWED_VIDEO_UPLOAD_EXTENSIONS).join(",")
        ),
        experimentalTiffSupportWarning: true,
        veryLargeSizeWarning: true
      }
    },
    {
      key: "skip_notifications",
      id: "skip_notifications",
      type: "checkbox",
      props: {
        label: this.translate.instant("Skip notifications"),
        description: this.translate.instant("Do not notify your followers about this revision."),
        change: this._onSkipNotificationsChange.bind(this)
      }
    },
    {
      key: "skip_activity_stream",
      id: "skip_activity_stream",
      type: "checkbox",
      props: {
        label: this.translate.instant("Skip activity stream"),
        description: this.translate.instant(
          "Do not create an entry on the front page's activity stream for this event."
        ),
        change: this._onSkipActivityStreamChange.bind(this)
      }
    },
    {
      key: "mark_as_final",
      id: "mark_as_final",
      type: "checkbox",
      props: {
        label: this.translate.instant("Mark as final"),
        description: this.translate.instant("Mark this revision as the final rendition of your image."),
        change: this._onMarkAsFinalChange.bind(this)
      }
    }
  ];

  imageThumbnail: string;

  image: ImageInterface;

  revisionCount: number;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly translate: TranslateService,
    public readonly uploaderService: UploadxService,
    public readonly uploadDataService: UploadDataService,
    public readonly windowRef: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly route: ActivatedRoute,
    public readonly titleService: TitleService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly router: Router,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly imageService: ImageService
  ) {
    super(store$);
  }

  get subHeader$(): Observable<string> {
    const message = (revisions: number) => {
      if (revisions < 0) {
        // Assume infinite.
        return this.translate.instant("Enjoy your unlimited revisions per image!");
      }

      if (revisions === 0) {
        return this.translate.instant("Sorry, revisions are not included at your membership level.");
      }

      if (revisions === 1) {
        return this.translate.instant("You may have up to one revision per image.");
      }

      return this.translate.instant("You may have up to {{0}} revisions per image.", { 0: revisions });
    };

    return new Observable<string>(observer => {
      this.currentUserProfile$
        .pipe(
          switchMap(currentUserProfile =>
            this.store$
              .select(selectBackendConfig)
              .pipe(map(backendConfig => ({ currentUserProfile, backendConfig })))
          ),
          map(({ currentUserProfile, backendConfig }) => {
            this.userSubscriptionService
              .hasValidSubscription$(currentUserProfile, [
                SubscriptionName.ASTROBIN_ULTIMATE_2020,
                SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY,
                SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY,
                SubscriptionName.ASTROBIN_PREMIUM,
                SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
                SubscriptionName.ASTROBIN_LITE,
                SubscriptionName.ASTROBIN_LITE_AUTORENEW
              ])
              .subscribe(has => {
                if (has) {
                  observer.next(message(-1));
                  observer.complete();
                }
              });

            this.userSubscriptionService
              .hasValidSubscription$(currentUserProfile, [
                SubscriptionName.ASTROBIN_PREMIUM_2020,
                SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
                SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY
              ])
              .subscribe(has => {
                if (has) {
                  observer.next(message(backendConfig.PREMIUM_MAX_REVISIONS_PREMIUM_2020));
                  observer.complete();
                }
              });

            this.userSubscriptionService
              .hasValidSubscription$(currentUserProfile, [
                SubscriptionName.ASTROBIN_LITE_2020,
                SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
                SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY
              ])
              .subscribe(has => {
                if (has) {
                  observer.next(message(backendConfig.PREMIUM_MAX_REVISIONS_LITE_2020));
                  observer.complete();
                }
              });

            this.userSubscriptionService
              .hasValidSubscription$(currentUserProfile, Object.values(SubscriptionName))
              .subscribe(has => {
                if (!has) {
                  observer.next(message(backendConfig.PREMIUM_MAX_REVISIONS_FREE_2020));
                  observer.complete();
                }
              });
          })
        )
        .subscribe();
    });
  }

  get mayUploadRevision$(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.currentUserProfile$
        .pipe(
          switchMap(currentUserProfile =>
            this.store$
              .select(selectBackendConfig)
              .pipe(map(backendConfig => ({ currentUserProfile, backendConfig })))
          ),
          map(({ currentUserProfile, backendConfig }) => {
            this.userSubscriptionService
              .hasValidSubscription$(currentUserProfile, [
                SubscriptionName.ASTROBIN_ULTIMATE_2020,
                SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_YEARLY,
                SubscriptionName.ASTROBIN_ULTIMATE_2020_AUTORENEW_MONTHLY,
                SubscriptionName.ASTROBIN_PREMIUM,
                SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
                SubscriptionName.ASTROBIN_LITE,
                SubscriptionName.ASTROBIN_LITE_AUTORENEW
              ])
              .subscribe(has => {
                if (has) {
                  observer.next(true);
                  observer.complete();
                }
              });

            this.userSubscriptionService
              .hasValidSubscription$(currentUserProfile, [
                SubscriptionName.ASTROBIN_PREMIUM_2020,
                SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_YEARLY,
                SubscriptionName.ASTROBIN_PREMIUM_2020_AUTORENEW_MONTHLY
              ])
              .subscribe(has => {
                if (has) {
                  observer.next(this.revisionCount < backendConfig.PREMIUM_MAX_REVISIONS_PREMIUM_2020);
                  observer.complete();
                }
              });

            this.userSubscriptionService
              .hasValidSubscription$(currentUserProfile, [
                SubscriptionName.ASTROBIN_LITE_2020,
                SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_YEARLY,
                SubscriptionName.ASTROBIN_LITE_2020_AUTORENEW_MONTHLY
              ])
              .subscribe(has => {
                if (has) {
                  observer.next(this.revisionCount < backendConfig.PREMIUM_MAX_REVISIONS_LITE_2020);
                  observer.complete();
                }
              });

            this.userSubscriptionService
              .hasValidSubscription$(currentUserProfile, Object.values(SubscriptionName))
              .subscribe(has => {
                if (!has) {
                  observer.next(this.revisionCount < backendConfig.PREMIUM_MAX_REVISIONS_FREE_2020);
                  observer.complete();
                }
              });
          })
        )
        .subscribe();
    });
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.image = this.route.snapshot.data.image;

    this._setTitle();
    this._setBreadcrumb();
    this._setUploadData();
    this._setThumbnail();
    this._setRevisionCount();
    this._onSkipNotificationsChange();
    this._onSkipActivityStreamChange();
    this._onMarkAsFinalChange();
  }

  onSubmit() {
    if (this.form.valid) {
      this.uploaderService.control({ action: "upload" });
    }
  }

  uploadButtonLoading(): boolean {
    return (
      this.form.valid &&
      this.uploadState &&
      ["queue", "uploading", "retry", "complete"].indexOf(this.uploadState.status) > -1
    );
  }

  private _setTitle() {
    this.titleService.setTitle(this.pageTitle);
  }

  private _setBreadcrumb() {
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          { label: this.translate.instant("Image") },
          { label: this.image.title },
          { label: this.pageTitle }
        ]
      })
    );
  }

  private _setUploadData() {
    this.uploadDataService.patchMetadata("image-upload", {
      image_id: this.image.pk,
      is_revision: true,
      description: Constants.NO_VALUE
    });

    this.uploaderService.events.pipe(takeUntil(this.destroyed$)).subscribe(uploadState => {
      this.uploadState = uploadState;

      if (uploadState.status === "complete") {
        const response = JSON.parse(uploadState.response as string);
        this.router.navigate(["i", response.image, response.label, "edit"]);
      }

      this.changeDetectorRef.markForCheck();
    });
  }

  private _setThumbnail() {
    this.imageThumbnail = this.imageService.getThumbnail(this.image, ImageAlias.GALLERY);
  }

  private _setRevisionCount() {
    this.revisionCount = this.image.revisions.length;
  }

  private _onSkipNotificationsChange() {
    this.uploadDataService.patchMetadata("image-upload", { skip_notifications: this.model.skip_notifications });
  }

  private _onSkipActivityStreamChange() {
    this.uploadDataService.patchMetadata("image-upload", { skip_activity_stream: this.model.skip_activity_stream });
  }

  private _onMarkAsFinalChange() {
    this.uploadDataService.patchMetadata("image-upload", { mark_as_final: this.model.mark_as_final });
  }
}
