import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";

@Component({
  selector: "astrobin-vendor-list-page",
  templateUrl: "./vendor-list.page-component.html",
  styleUrls: ["./vendor-list.page-component.scss"],
})
export class VendorListPageComponent {
  public vendors: VendorInterface[];
  public constructor(public readonly activatedRoute: ActivatedRoute) {
    this.vendors = this.activatedRoute.snapshot.data.vendors;
  }
}
