import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Observable } from "rxjs";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";
import { switchMap } from "rxjs/operators";
import { VendorApiService } from "@feats/equipment/services/api/vendor-api.service";

@Component({
  selector: "astrobin-vendor-detail-page",
  templateUrl: "./vendor-detail.page-component.html",
  styleUrls: ["./vendor-detail.page-component.scss"],
})
export class VendorDetailPageComponent implements OnInit {
  public vendor$: Observable<VendorInterface>;

  constructor(
    public readonly route: ActivatedRoute,
    public readonly api: VendorApiService) {
  }

  ngOnInit() {
    this.vendor$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.api.retrieve(params.get("id"))),
    );
  }
}
