import { Component } from "@angular/core";
import { BaseComponent } from "@shared/components/base.component";

@Component({
  selector: "astrobin-empty-list",
  templateUrl: "./empty-list.component.html",
  styleUrls: ["./empty-list.component.scss"]
})
export class EmptyListComponent extends BaseComponent {}
