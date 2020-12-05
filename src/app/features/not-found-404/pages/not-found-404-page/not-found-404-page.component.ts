import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { TitleService } from "@shared/services/title/title.service";

@Component({
  selector: "astrobin-not-found-page",
  templateUrl: "./not-found-404-page.component.html"
})
export class NotFound404PageComponent extends BaseComponentDirective {
  constructor(public titleService: TitleService, public translate: TranslateService) {
    super();
    titleService.setTitle(translate.instant("404"));
  }
}
