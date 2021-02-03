import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { FormlyFieldStepperComponent } from "@shared/components/misc/formly-field-stepper/formly-field-stepper.component";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageInterface } from "@shared/interfaces/image.interface";

@Component({
  selector: "astrobin-formly-field-image-edit-stepper",
  templateUrl: "./formly-field-image-edit-stepper.component.html",
  styleUrls: ["./formly-field-image-edit-stepper.component.scss"]
})
export class FormlyFieldImageEditStepperComponent extends FormlyFieldStepperComponent {
  ImageAlias = ImageAlias;

  constructor(public translateService: TranslateService) {
    super(translateService);
  }

  get image(): ImageInterface {
    return this.to.image as ImageInterface;
  }
}
