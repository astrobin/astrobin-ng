import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { TitleService } from "@shared/services/title/title.service";

@Component({
  selector: "astrobin-logged-out-page",
  templateUrl: "./logged-out-page.component.html"
})
export class LoggedOutPageComponent extends BaseComponentDirective {
  constructor(public titleService: TitleService, public translate: TranslateService) {
    super();
    titleService.setTitle(translate.instant("Good bye!"));
  }
}
