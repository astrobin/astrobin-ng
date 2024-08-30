import { AfterViewInit, Component, HostListener, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Observable, of } from "rxjs";
import { ComponentCanDeactivate } from "@shared/services/guards/pending-changes-guard.service";
import { isPlatformBrowser } from "@angular/common";
import { ImageInterface, ImageRevisionInterface, MouseHoverImageOptions } from "@shared/interfaces/image.interface";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TitleService } from "@shared/services/title/title.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageEditorSetCropperShown } from "@features/image/store/image.actions";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { SaveImageRevision, SaveImageRevisionSuccess } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { filter, take } from "rxjs/operators";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { ImageEditSettingsFieldsService } from "@features/image/services/image-edit-settings-fields.service";

@Component({
  selector: "astrobin-image-edit-revision-page",
  templateUrl: "./image-edit-revision-page.component.html",
  styleUrls: ["./image-edit-revision-page.component.scss"]
})
export class ImageEditRevisionPageComponent
  extends BaseComponentDirective
  implements OnInit, ComponentCanDeactivate, AfterViewInit {
  protected pageTitle: string;
  protected isBrowser: boolean;
  protected image: ImageInterface;
  protected revisionLabel: ImageRevisionInterface["label"];
  protected revision: ImageRevisionInterface;
  protected imageThumbnail: string;
  protected thumbnail: string;
  protected readonly form = new FormGroup({});
  protected model: Partial<ImageRevisionInterface>;
  protected fields: FormlyFieldConfig[] = [];
  protected saving = false;


  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly route: ActivatedRoute,
    public readonly translateService: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly titleService: TitleService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly imageEditSettingsFieldsService: ImageEditSettingsFieldsService
  ) {
    super(store$);
  }

  @HostListener("window:beforeunload")
  canDeactivate(): Observable<boolean> | boolean {
    return this.form.pristine;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.isBrowser = isPlatformBrowser(this.platformId);
    this.image = this.route.snapshot.data.image;
    this.revisionLabel = this.route.snapshot.params.revisionLabel;
    this.revision = this.image.revisions.find(revision => revision.label === this.revisionLabel);
    this.model = {
      pk: this.revision.pk,
      title: this.revision.title,
      description: this.revision.description,
      mouseHoverImage: this.revision.mouseHoverImage,
      squareCropping: this.revision.squareCropping
    };

    this.imageThumbnail = this.image.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.GALLERY).url;
    this.thumbnail = this.image.revisions.find(
      revision => revision.label === this.revisionLabel
    ).thumbnails.find(
      thumbnail => thumbnail.alias === ImageAlias.HD
    ).url;

    this._setTitle();
    this._initBreadcrumb();
  }

  ngAfterViewInit(): void {
    this._initFields();
    this.store$.dispatch(new ImageEditorSetCropperShown(true));
  }

  onSave(event: Event) {
    event.preventDefault();

    this.saving = true;

    this.actions$.pipe(
      ofType(AppActionTypes.SAVE_IMAGE_REVISION_SUCCESS),
      filter((action: SaveImageRevisionSuccess) =>
        action.payload.revision.label === this.revisionLabel &&
        action.payload.revision.image === this.image.pk
      ),
      take(1)
    ).subscribe(() => {
      this.form.markAsPristine();
      this._returnToImage();
    });

    this.actions$.pipe(
      ofType(AppActionTypes.SAVE_IMAGE_REVISION_FAILURE),
      filter((action: SaveImageRevisionSuccess) =>
        action.payload.revision.label === this.revisionLabel &&
        action.payload.revision.image === this.image.pk
      ),
      take(1)
    ).subscribe(() => {
      this.saving = false;
    });

    this.store$.dispatch(new SaveImageRevision({ revision: this.model }));
  }

  onCancel(event: Event) {
    event.preventDefault();
    this._returnToImage();
  }

  private _returnToImage(): void {
    // DEPRECATED: change to new image viewer page when migration is complete.
    this.windowRefService.nativeWindow.location.href =
      this.classicRoutesService.IMAGE_REVISION(this.image.hash || this.image.pk, this.revisionLabel);
  }

  private _initFields(): void {
    this.fields = [
      {
        key: "title",
        wrappers: ["default-wrapper"],
        id: "title",
        type: "input",
        props: {
          label: this.translateService.instant("Title"),
          description: this.translateService.instant(
            "The revision's title will be shown as an addendum to the original image's title."
          ),
          required: false,
          maxLength: 128
        }
      },
      {
        key: "description",
        id: "description",
        type: "textarea",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Description"),
          required: false,
          rows: 4
        }
      },
      this._getMouseHoverImageField(),
      {
        key: "squareCropping",
        type: "image-cropper",
        id: "image-cropper-field",
        props: {
          required: false,
          description: this.translateService.instant(
            "Select an area of the image to be used as thumbnail in your gallery."
          ),
          image: this.revision,
          thumbnailURL$: of(this.thumbnail)
        }
      }
    ];
  }

  private _setTitle() {
    this.pageTitle = this.translateService.instant("Edit revision");
    this.titleService.setTitle(
      this.image.title +
      " - " +
      this.pageTitle +
      " - " +
      this.revisionLabel
    );
  }

  private _initBreadcrumb(): void {
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Image")
          },
          {
            label: this.image.title
          },
          {
            label: this.pageTitle
          },
          {
            label: this.revisionLabel
          }
        ]
      })
    );
  }

  private _getMouseHoverImageField(): FormlyFieldConfig {
    const options: {
      value: MouseHoverImageOptions | string;
      label: string;
      disabled?: boolean;
    }[] = this.imageEditSettingsFieldsService.basicMouseHoverOptions();

    const additionalOptions: {
      value: MouseHoverImageOptions | string,
      label: string,
      disabled?: boolean
    }[] = this.imageEditSettingsFieldsService.additionalMouseHoverOptions(
      this.image,
      this.image.revisions.filter(revision => revision.pk !== this.revision.pk)
    );

    return {
      key: "mouseHoverImage",
      type: "ng-select",
      props: {
        required: true,
        clearable: false,
        label: this.imageEditSettingsFieldsService.mouseHoverImageLabel(),
        description: this.imageEditSettingsFieldsService.mouseHoverImageDescription(),
        options: [...options, ...additionalOptions]
      }
    };
  }
}
