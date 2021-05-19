import { Component } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-formly-field-ng-select",
  templateUrl: "./formly-field-ng-select.component.html",
  styleUrls: ["./formly-field-ng-select.component.scss"]
})
export class FormlyFieldNgSelectComponent extends FieldType {
  constructor(public readonly translateService: TranslateService) {
    super();
  }

  get placeholder(): string {
    if (this.to.addTag) {
      return this.translateService.instant("Type to search options or to create a new one...");
    }

    return this.translateService.instant("Type to search options...");
  }

  get notFoundText(): string {
    if (this.to.addTag) {
      return (
        this.translateService.instant("No items found.") +
        " " +
        this.translateService.instant("Type something to create a new one...")
      );
    }

    return this.translateService.instant("No items found.");
  }
}
