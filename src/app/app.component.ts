import { Component } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ValidationLoaderService } from "@shared/services/validation-loader.service";

declare const gtag: any;

@Component({
  selector: "astrobin-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent extends BaseComponentDirective {
  constructor(
    public router: Router,
    public paginationConfig: NgbPaginationConfig,
    public validationLoaderService: ValidationLoaderService
  ) {
    super();
    this.initRouterEvents();
    this.initPagination();
    this.validationLoaderService.init();
  }

  initPagination(): void {
    this.paginationConfig.pageSize = 50;
    this.paginationConfig.maxSize = 5;
    this.paginationConfig.rotate = true;
  }

  initRouterEvents(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.tagGoogleAnalyticsPage(event.urlAfterRedirects);
      }
    });
  }

  tagGoogleAnalyticsPage(url: string): void {
    if (typeof gtag !== "undefined") {
      gtag("config", "UA-844985-10", {
        page_path: url
      });
    }
  }
}
