import { Component } from "@angular/core";
import { AppContextService } from "@lib/services/app-context.service";
import { NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { take } from "rxjs/operators";

@Component({
  selector: "astrobin-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  private _defaultLanguage = "en";

  constructor(
    public translate: TranslateService,
    public paginationConfig: NgbPaginationConfig,
    public appContext: AppContextService
  ) {
    this.initTranslate();
    this.initPagination();
  }

  initTranslate(): void {
    this.translate.setDefaultLang(this._defaultLanguage);
    this.appContext
      .get()
      .pipe(take(1))
      .subscribe(appContext => {
        this.translate.use(
          appContext.currentUserProfile ? appContext.currentUserProfile.language : this._defaultLanguage
        );
      });
  }

  initPagination(): void {
    this.paginationConfig.pageSize = 50;
    this.paginationConfig.maxSize = 5;
    this.paginationConfig.rotate = true;
  }
}
