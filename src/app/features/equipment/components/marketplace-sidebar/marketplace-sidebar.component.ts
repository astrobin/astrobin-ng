import { Component, EventEmitter, HostListener, OnInit, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MarketplaceFilterModel } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";

@Component({
  selector: "astrobin-marketplace-sidebar",
  templateUrl: "./marketplace-sidebar.component.html",
  styleUrls: ["./marketplace-sidebar.component.scss"]
})
export class MarketplaceSidebarComponent extends BaseComponentDirective implements OnInit {
  collapsed: boolean = false;

  @Output()
  filterChange = new EventEmitter<MarketplaceFilterModel>();

  @HostListener("window:resize", ["$event"])
  onResize(event?: any) {
    this.collapsed = window.innerWidth <= 768;
  }

  ngOnInit(): void {
    this.onResize();
  }
}
