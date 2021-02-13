import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { FormlyFieldStepperComponent } from "@shared/components/misc/formly-field-stepper/formly-field-stepper.component";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { NgWizardConfig } from "ng-wizard";

@Component({
  selector: "astrobin-formly-field-image-edit-stepper",
  templateUrl: "./formly-field-image-edit-stepper.component.html",
  styleUrls: ["./formly-field-image-edit-stepper.component.scss"]
})
export class FormlyFieldImageEditStepperComponent extends FormlyFieldStepperComponent implements OnInit {
  ImageAlias = ImageAlias;
  config: NgWizardConfig;

  constructor(public translateService: TranslateService) {
    super(translateService);
  }

  ngOnInit(): void {
    this.config = {
      lang: {
        next: this.translateService.instant("Next"),
        previous: this.translateService.instant("Previous")
      },
      toolbarSettings: {
        toolbarExtraButtons: [
          {
            text: this.translateService.instant("Save"),
            class: "btn btn-primary",
            event: () => {
              alert("Finished!!!");
            }
          }
        ]
      }
    };
  }

  get image(): ImageInterface {
    return this.to.image as ImageInterface;
  }
}
