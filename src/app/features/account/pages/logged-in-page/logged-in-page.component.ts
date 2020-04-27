import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { ClassicRoutesService } from "@shareed/services/classic-routes.service";
import { interval } from "rxjs";
import { take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-logged-in-page",
  templateUrl: "./logged-in-page.component.html"
})
export class LoggedInPageComponent implements OnInit {
  seconds = 3;
  redirectUrl: string;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public windowRef: WindowRefService,
    public classicRoutesService: ClassicRoutesService,
    public titleService: TitleService,
    public translate: TranslateService
  ) {
    titleService.setTitle(translate.instant("Welcome!"));
  }

  get redirectionMessage(): string {
    return "You will be redirected in {{seconds}} seconds...";
  }

  ngOnInit(): void {
    this.redirectUrl = this.route.snapshot.queryParamMap.get("redirectUrl");

    interval(1000)
      .pipe(
        take(this.seconds),
        tap(() => this.seconds--)
      )
      .subscribe(() => {
        if (this.seconds === 0) {
          if (this.redirectUrl) {
            this.router.navigateByUrl(this.redirectUrl);
          } else {
            this.windowRef.nativeWindow.location.assign(this.classicRoutesService.HOME);
          }
        }
      });
  }
}
