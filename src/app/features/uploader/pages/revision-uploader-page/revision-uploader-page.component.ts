import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { State } from "@app/store/state";
import { environment } from "@env/environment";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Constants } from "@shared/constants";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ThumbnailGroupApiService } from "@shared/services/api/classic/images/thumbnail-group/thumbnail-group-api.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { TitleService } from "@shared/services/title/title.service";
import { UploadDataService } from "@shared/services/upload-metadata/upload-data.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UploadState, UploadxService } from "ngx-uploadx";
import { Observable } from "rxjs";
import { map, switchMap, takeUntil } from "rxjs/operators";
import { SubscriptionName } from "@shared/types/subscription-name.type";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { LoadImageRevisions } from "@app/store/actions/image.actions";
import { selectImageRevisionsForImage } from "@app/store/selectors/app/image-revision.selectors";
import { Actions } from "@ngrx/effects";

@Component({
  selector: "astrobin-revision-uploader-page",
  templateUrl: "./revision-uploader-page.component.html",
  styleUrls: ["./revision-uploader-page.component.scss"]
})
export class RevisionUploaderPageComponent extends BaseComponentDirective implements OnInit {
  SubscriptionName = SubscriptionName;

  form = new FormGroup({});
  uploadState: UploadState;
  pageTitle = this.translate.instant("Revision uploader");

  model = {
    image_file: "",
    description: "",
    skip_notifications: false,
    mark_as_final: true
  };

  fields: FormlyFieldConfig[] = [
    {
      key: "image_file",
      id: "image_file",
      type: "chunked-file",
      templateOptions: {
        required: true,
        experimentalTiffSupportWarning: true,
        veryLargeSizeWarning: true
      }
    },
    {
      key: "description",
      id: "description",
      type: "textarea",
      templateOptions: {
        label: this.translate.instant("Description"),
        required: false,
        change: this._onDescriptionChange.bind(this),
        rows: 4
      }
    },
    {
      key: "skip_notifications",
      id: "skip_notifications",
      type: "checkbox",
      templateOptions: {
        label: this.translate.instant("Skip notifications"),
        description: this.translate.instant("Do not notify your followers about this revision."),
        change: this._onSkipNotificationsChange.bind(this)
      }
    },
    {
      key: "mark_as_final",
      id: "mark_as_final",
      type: "checkbox",
      templateOptions: {
        label: this.translate.instant("Mark as final"),
        description: this.translate.instant("Mark this revision as the final rendition of your image."),
        change: this._onMarkAsFinalChange.bind(this)
      }
    }
  ];

  imageThumbnail$: Observable<string>;

  image: ImageInterface;

  revisionCount: number;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translate: TranslateService,
    public readonly uploaderService: UploadxService,
    public readonly uploadDataService: UploadDataService,
    public readonly windowRef: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly route: ActivatedRoute,
    public readonly titleService: TitleService,
    public readonly thumbnailGroupApiService: ThumbnailGroupApiService,
    public readonly userSubscriptionService: UserSubscriptionService
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
            this.store$.select(selectBackendConfig).pipe(map(backendConfig => ({ currentUserProfile, backendConfig })))
          ),
          map(({ currentUserProfile, backendConfig }) => {
            this.userSubscriptionService
              .hasValidSubscription$(currentUserProfile, [
                SubscriptionName.ASTROBIN_ULTIMATE_2020,
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
              .hasValidSubscription$(currentUserProfile, [SubscriptionName.ASTROBIN_PREMIUM_2020])
              .subscribe(has => {
                if (has) {
                  observer.next(message(backendConfig.PREMIUM_MAX_REVISIONS_PREMIUM_2020));
                  observer.complete();
                }
              });

            this.userSubscriptionService
              .hasValidSubscription$(currentUserProfile, [SubscriptionName.ASTROBIN_LITE_2020])
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
            this.store$.select(selectBackendConfig).pipe(map(backendConfig => ({ currentUserProfile, backendConfig })))
          ),
          map(({ currentUserProfile, backendConfig }) => {
            this.userSubscriptionService
              .hasValidSubscription$(currentUserProfile, [
                SubscriptionName.ASTROBIN_ULTIMATE_2020,
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
              .hasValidSubscription$(currentUserProfile, [SubscriptionName.ASTROBIN_PREMIUM_2020])
              .subscribe(has => {
                if (has) {
                  observer.next(this.revisionCount < backendConfig.PREMIUM_MAX_REVISIONS_PREMIUM_2020);
                  observer.complete();
                }
              });

            this.userSubscriptionService
              .hasValidSubscription$(currentUserProfile, [SubscriptionName.ASTROBIN_LITE_2020])
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
    this.image = this.route.snapshot.data.image;

    this._setTitle();
    this._setBreadcrumb();
    this._setUploadData();
    this._setThumbnail();
    this._setRevisionCount();

    this._onDescriptionChange();
    this._onSkipNotificationsChange();
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
        breadcrumb: [{ label: this.translate.instant("Image") }, { label: this.image.title }, { label: this.pageTitle }]
      })
    );
  }

  private _setUploadData() {
    this.uploadDataService.patchMetadata("image-upload", {
      image_id: this.image.pk,
      is_revision: true,
      description: Constants.NO_VALUE
    });

    this.store$.select(selectBackendConfig).subscribe(backendConfig => {
      this.uploadDataService.setEndpoint(
        `${environment.classicBaseUrl}${backendConfig.IMAGE_REVISION_UPLOAD_ENDPOINT}`
      );
    });

    this.uploaderService.events.pipe(takeUntil(this.destroyed$)).subscribe(uploadState => {
      this.uploadState = uploadState;

      if (uploadState.status === "complete") {
        const response = JSON.parse(uploadState.response as string);
        // @ts-ignore
        this.windowRef.nativeWindow.location.assign(this.classicRoutesService.EDIT_IMAGE_REVISION(response.pk));
      }
    });
  }

  private _setThumbnail() {
    this.imageThumbnail$ = this.thumbnailGroupApiService
      .getThumbnailGroup(this.image.pk, Constants.ORIGINAL_REVISION)
      .pipe(map(thumbnailGroup => thumbnailGroup.gallery));
  }

  private _setRevisionCount() {
    this.store$.dispatch(new LoadImageRevisions({ imageId: this.image.pk }));
    this.store$
      .select(selectImageRevisionsForImage, this.image.pk)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(imageRevisions => (this.revisionCount = imageRevisions.length));
  }

  private _onDescriptionChange() {
    this.uploadDataService.patchMetadata("image-upload", { description: this.model.description || Constants.NO_VALUE });
  }

  private _onSkipNotificationsChange() {
    this.uploadDataService.patchMetadata("image-upload", { skip_notifications: this.model.skip_notifications });
  }

  private _onMarkAsFinalChange() {
    this.uploadDataService.patchMetadata("image-upload", { mark_as_final: this.model.mark_as_final });
  }
}
