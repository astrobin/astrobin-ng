import { Component, OnInit } from "@angular/core";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Component({
  selector: "astrobin-permission-denied-page",
  templateUrl: "./permission-denied-page.component.html"
})
export class PermissionDeniedPageComponent implements OnInit {
  constructor(public classicRoutes: ClassicRoutesService) {}

  ngOnInit(): void {}
}
