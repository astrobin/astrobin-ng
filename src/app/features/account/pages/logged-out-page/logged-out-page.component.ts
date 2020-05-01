import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponent } from "@shared/components/base.component";
import { TitleService } from "@shared/services/title/title.service";

@Component({
  selector: "astrobin-logged-out-page",
  templateUrl: "./logged-out-page.component.html"
})
export class LoggedOutPageComponent extends BaseComponent {
  constructor(public titleService: TitleService, public translate: TranslateService) {
    super();
    titleService.setTitle(translate.instant("Good bye!"));
  }
}
