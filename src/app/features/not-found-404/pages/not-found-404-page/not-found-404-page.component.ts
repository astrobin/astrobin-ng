import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponent } from "@shared/components/base.component";
import { TitleService } from "@shared/services/title/title.service";

@Component({
  selector: "astrobin-not-found-page",
  templateUrl: "./not-found-404-page.component.html"
})
export class NotFound404PageComponent extends BaseComponent {
  constructor(public titleService: TitleService, public translate: TranslateService) {
    super();
    titleService.setTitle(translate.instant("404"));
  }
}
