import { Component } from "@angular/core";
import { TitleService } from "@lib/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-not-found-page",
  templateUrl: "./not-found-404-page.component.html"
})
export class NotFound404PageComponent {
  constructor(public titleService: TitleService, public translate: TranslateService) {
    titleService.setTitle(translate.instant("404"));
  }
}
