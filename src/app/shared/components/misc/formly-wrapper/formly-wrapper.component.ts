import { Component } from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";

@Component({
  selector: "astrobin-formly-wrapper",
  templateUrl: "./formly-wrapper.component.html",
  styleUrls: ["./formly-wrapper.component.scss"]
})
export class FormlyWrapperComponent extends FieldWrapper {
  closeWarning() {
    this.to.warningMessage = null;
    this.to.warningTemplate = null;
    this.to.warningTemplateData = null;
  }

  closeInfo() {
    this.to.infoMessage = null;
    this.to.infoTemplate = null;
    this.to.infoTemplateData = null;
  }
}
