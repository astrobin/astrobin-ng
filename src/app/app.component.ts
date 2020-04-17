import { Component } from "@angular/core";
import { NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "AstroBin";

  constructor(public translate: TranslateService, public paginationConfig: NgbPaginationConfig) {
    this.initTranslate();
    this.initPagination();
  }

  initTranslate(): void {
    // this language will be used as a fallback when a translation isn't found in the current language
    this.translate.setDefaultLang("en");

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    this.translate.use("en");
  }

  initPagination(): void {
    this.paginationConfig.pageSize = 50;
    this.paginationConfig.maxSize = 5;
    this.paginationConfig.rotate = true;
  }
}
