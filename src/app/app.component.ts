import { Component } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { State } from "@app/store/state";
import { NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ThemeService } from "@shared/services/theme.service";

declare const gtag: any;

@Component({
  selector: "astrobin-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent extends BaseComponentDirective {
  constructor(
    public readonly router: Router,
    public readonly paginationConfig: NgbPaginationConfig,
    public readonly store$: Store<State>,
    public readonly themeService: ThemeService
  ) {
    super();
    this.initRouterEvents();
    this.initPagination();
    this.themeService.setTheme();
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
