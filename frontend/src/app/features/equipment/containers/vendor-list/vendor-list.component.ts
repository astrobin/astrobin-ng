import { Component, EventEmitter, Input, Output } from "@angular/core";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";
import { Router } from "@angular/router";

@Component({
  selector: "astrobin-vendor-list",
  templateUrl: "./vendor-list.component.html",
  styleUrls: ["./vendor-list.component.scss"],
})
export class VendorListComponent {
  @Input()
  public vendors: VendorInterface[];

  public constructor(public readonly router: Router) {
  }

  public vendorClicked(vendor: VendorInterface) {
    this.router.navigate([`equipment/vendors/${vendor.id}`]);
  }
}
