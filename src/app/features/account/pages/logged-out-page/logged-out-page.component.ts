import { Component } from "@angular/core";
import { TitleService } from "@lib/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-logged-out-page",
  templateUrl: "./logged-out-page.component.html"
})
export class LoggedOutPageComponent {
  constructor(public titleService: TitleService, public translate: TranslateService) {
    titleService.setTitle(translate.instant("Good bye!"));
  }
}
