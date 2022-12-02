import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";

@Component({
  selector: "astrobin-formly-card-wrapper",
  templateUrl: "./formly-card-wrapper.component.html",
  styleUrls: ["./formly-card-wrapper.component.scss"]
})
export class FormlyCardWrapperComponent extends FieldWrapper {
  @ViewChild("fieldComponent", { read: ViewContainerRef })
  fieldComponent: ViewContainerRef;
}
