import { Component, OnDestroy, OnInit } from "@angular/core";
import { SessionService } from "@lib/services/session.service";
import { Router } from "@angular/router";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";
import { VendorService } from "@feats/equipment/services/vendor.service";

@Component({
  selector: "astrobin-vendor-check-similar-page",
  templateUrl: "./vendor-check-similar.page-component.html",
  styleUrls: ["./vendor-check-similar.page-component.scss"],
})
export class  VendorCheckSimilarPageComponent implements OnInit, OnDestroy {
  public static readonly SESSION_KEY = "check-similar";
  public readonly similarVendors: VendorInterface[];
  public readonly model: VendorInterface;

  constructor(
    public readonly session: SessionService,
    public readonly router: Router,
    public readonly vendorService: VendorService) {
    const sessionObject = this.session.get(VendorCheckSimilarPageComponent.SESSION_KEY);
    if (sessionObject) {
      this.similarVendors = sessionObject.similar;
      this.model = sessionObject.model;
    }
  }

  public ngOnInit(): void {
    if (this.similarVendors === undefined) {
      this.router.navigate(["/equipment/vendors/create"]);
    }
  }

  public ngOnDestroy(): void {
    this.session.delete(VendorCheckSimilarPageComponent.SESSION_KEY);
  }

  public save(): void {
    this.vendorService.create(this.model).subscribe();
  }
}
