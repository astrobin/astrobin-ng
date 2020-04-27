import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";

@Component({
  selector: "astrobin-logged-out-page",
  templateUrl: "./logged-out-page.component.html"
})
export class LoggedOutPageComponent {
  constructor(public titleService: TitleService, public translate: TranslateService) {
    titleService.setTitle(translate.instant("Good bye!"));
  }
}
