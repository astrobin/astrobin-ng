import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MainState } from "@app/store/state";
import { environment } from "@env/environment";
import { select, Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Constants } from "@shared/constants";
import { ImageInterface } from "@core/interfaces/image.interface";
import { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { ThumbnailGroupApiService } from "@core/services/api/classic/images/thumbnail-group/thumbnail-group-api.service";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { TitleService } from "@core/services/title/title.service";
import { UploadDataService } from "@core/services/upload-metadata/upload-data.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { UploadState, UploadxService } from "ngx-uploadx";
import { Observable } from "rxjs";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { ModalService } from "@core/services/modal.service";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { DeleteImageUncompressedSourceFile, DeleteImageUncompressedSourceFileFailure, DeleteImageUncompressedSourceFileSuccess } from "@app/store/actions/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { UtilsService } from "@core/services/utils/utils.service";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { ImageService } from "@core/services/image/image.service";

@Component({
  selector: "astrobin-uncompressed-source-uploader-page",
  templateUrl: "./uncompressed-source-uploader-page.component.html",
  styleUrls: ["./uncompressed-source-uploader-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UncompressedSourceUploaderPageComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  readonly form = new FormGroup({});
  readonly pageTitle = this.translate.instant("Uncompressed source uploader");
  readonly model = {
    image_file: ""
  };

  uploadState: UploadState;
  fields: FormlyFieldConfig[];
  imageThumbnail: string;
  image: ImageInterface;
  deleting = false;

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
    public readonly imageApiService: ImageApiService,
    public readonly modalService: ModalService,
    public readonly utilsService: UtilsService,
    public readonly imageService: ImageService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._initImage();
    this._initFields();
    this._initTitle();
    this._initBreadcrumb();
    this._initThumbnail();
  }

  ngAfterViewInit(): void {
    this.utilsService.delay(1).subscribe(() => {
      this._initUploadService();
      this.changeDetectorRef.detectChanges();
    });
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

  deleteUncompressedSourceFile() {
    const modalRef = this.modalService.open(ConfirmationDialogComponent);
    const instance = modalRef.componentInstance;
    instance.message = this.translate.instant(
      "You are about to delete the uncompressed source file that you associated to this image. " +
      "This action cannot be undone."
    );

    modalRef.closed.pipe(take(1)).subscribe(() => {
      this.deleting = true;
      this.changeDetectorRef.markForCheck();

      this.actions$.pipe(
        ofType(AppActionTypes.DELETE_IMAGE_UNCOMPRESSED_SOURCE_FILE_SUCCESS),
        filter((action: DeleteImageUncompressedSourceFileSuccess) => this.image.pk === action.payload.image.pk),
        take(1)
      ).subscribe(() => {
        this.deleting = false;
        this.fields = this.fields.map(field => {
          if (field.key === "download") {
            field.template = "";
          }
          return field;
        });
        this.changeDetectorRef.markForCheck();
      });

      this.actions$.pipe(
        ofType(AppActionTypes.DELETE_IMAGE_UNCOMPRESSED_SOURCE_FILE_FAILURE),
        filter((action: DeleteImageUncompressedSourceFileFailure) => this.image.pk === action.payload.pk),
        take(1)
      ).subscribe(() => {
        this.deleting = false;
        this.changeDetectorRef.markForCheck();
      });


      this.store$.dispatch(new DeleteImageUncompressedSourceFile({ pk: this.image.pk }));
    });
  }

  private _initImage(): void {
    this.image = this.route.snapshot.data.image;

    this.store$.pipe(
      select(selectImage, this.image.pk),
      filter(image => !!image),
      takeUntil(this.destroyed$)
    ).subscribe(image => {
      this.image = image;
      this._initThumbnail();
      this.changeDetectorRef.markForCheck();
    });
  }

  private _initFields(): void {
    this.fields = [
      {
        key: "image_file",
        id: "image_file",
        type: "chunked-file",
        props: {
          required: true,
          endpoint: `${environment.classicApiUrl}/api/v2/images/uncompressed-source-upload/`,
          allowedTypes: Constants.ALLOWED_UNCOMPRESSED_SOURCE_UPLOAD_EXTENSIONS,
          uploadLabel: this.uploadDataService.getUploadLabel(
            Constants.ALLOWED_UNCOMPRESSED_SOURCE_UPLOAD_EXTENSIONS.join(",")
          ),
        }
      },
      {
        key: "download",
        type: "formly-template",
        template: this._getDownloadTemplate()
      }
    ];
  }


  private _getDownloadTemplate(): string {
    if (!this.image?.uncompressedSourceFile) {
      return "";
    }

    return `
    <p>
      ${this.translate.instant("This image already has an uncompressed source file.")}
      <a
        class="btn btn-xs btn-primary no-external-link-icon ms-2"
        href="${this.image.uncompressedSourceFile}"
        target="_blank"
      >
        ${this.translate.instant("Download")}
      </a>
    </p>
  `;
  }

  private _initTitle(): void {
    this.titleService.setTitle(this.pageTitle);
  }

  private _initBreadcrumb(): void {
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

  private _initThumbnail(): void {
    this.imageThumbnail = this.imageService.getThumbnail(this.image, ImageAlias.GALLERY);
  }

  private _initUploadService(): void {
    this.uploadDataService.patchMetadata("image-upload", { image_id: this.image.pk });
    this.uploadDataService.patchMetadata("image-upload", {
      allowedExtensions: Constants.ALLOWED_UNCOMPRESSED_SOURCE_UPLOAD_EXTENSIONS
    });

    this.uploaderService.events.pipe(takeUntil(this.destroyed$)).subscribe(uploadState => {
      this.uploadState = uploadState;

      if (uploadState.status === "complete") {
        const response = JSON.parse(uploadState.response as string);
        this.imageApiService
          .getImage(response.image)
          .pipe(take(1))
          .subscribe(image => {
            // @ts-ignore
            this.windowRef.nativeWindow.location.assign(this.classicRoutesService.IMAGE(image.hash || "" + image.pk));
          });
      }

      this.changeDetectorRef.markForCheck();
    });
  }
}
