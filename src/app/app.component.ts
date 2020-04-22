import { Component } from "@angular/core";
import { NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "astrobin-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  constructor(public paginationConfig: NgbPaginationConfig) {
    this.initPagination();
  }

  initPagination(): void {
    this.paginationConfig.pageSize = 50;
    this.paginationConfig.maxSize = 5;
    this.paginationConfig.rotate = true;
  }
}
