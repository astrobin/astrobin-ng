import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";

@Component({
  selector: "astrobin-not-found-page",
  templateUrl: "./not-found-404-page.component.html"
})
export class NotFound404PageComponent {
  constructor(public titleService: TitleService, public translate: TranslateService) {
    titleService.setTitle(translate.instant("404"));
  }
}
