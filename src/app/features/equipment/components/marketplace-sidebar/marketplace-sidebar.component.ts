import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-marketplace-sidebar",
  templateUrl: "./marketplace-sidebar.component.html",
  styleUrls: ["./marketplace-sidebar.component.scss"]
})
export class MarketplaceSidebarComponent extends BaseComponentDirective implements OnInit {
  
}
