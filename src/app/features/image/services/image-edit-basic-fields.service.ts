import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { TranslateService } from "@ngx-translate/core";
import { ImageEditService } from "@features/image/services/image-edit.service";

@Injectable({
  providedIn: null
})
export class ImageEditBasicFieldsService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageEditService: ImageEditService
  ) {
    super(loadingService);
  }

  getTitleField(): any {
    return {
      key: "title",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "image-title-field",
      templateOptions: {
        label: this.translateService.instant("Title"),
        required: true
      }
    };
  }

  getDescriptionHtmlField(): any {
    return {
      key: "description",
      type: "textarea",
      wrappers: ["default-wrapper"],
      id: "image-description-field",
      templateOptions: {
        label: this.translateService.instant("Description"),
        description: this.translateService.instant("HTML tags are allowed."),
        required: false,
        rows: 10
      }
    };
  }

  getDescriptionBBCodeField(): any {
    return {
      key: "descriptionBbcode",
      type: "ckeditor",
      wrappers: ["default-wrapper"],
      id: "image-description-field",
      templateOptions: {
        label: this.translateService.instant("Description"),
        required: false
      }
    };
  }

  getDescriptionField(): any {
    if (
      this.imageEditService.image.descriptionBbcode ||
      (!this.imageEditService.image.descriptionBbcode && !this.imageEditService.image.description)
    ) {
      return this.getDescriptionBBCodeField();
    }

    return this.getDescriptionHtmlField();
  }

  getLinkField(): any {
    return {
      key: "link",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "image-link-field",
      templateOptions: {
        label: this.translateService.instant("Link"),
        description: this.translateService.instant(
          "If you're hosting a copy of this image on your website, put the address here."
        ),
        placeholder: this.translateService.instant("e.g.") + " https://www.example.com/my-page.html",
        required: false
      },
      validators: {
        validation: ["url"]
      }
    };
  }

  getLinkToFitsField(): any {
    return {
      key: "linkToFits",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "image-link-to-fits-field",
      templateOptions: {
        label: this.translateService.instant("Link to TIFF/FITS"),
        description: this.translateService.instant(
          "If you want to share the TIFF or FITS file of your image, put a link to the file here. " +
            "Unfortunately, AstroBin cannot offer to store these files at the moment, so you will have to " +
            "host them on your personal space."
        ),
        placeholder: this.translateService.instant("e.g.") + " https://www.example.com/my-page.html",
        required: false
      },
      validators: {
        validation: ["url"]
      }
    };
  }
}
