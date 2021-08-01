import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { PLACEHOLDER } from "@features/equipment/components/equipment-item-summary/equipment-item-summary.component";

@Component({
  selector: "astrobin-brand-summary",
  templateUrl: "./brand-summary.component.html",
  styleUrls: ["./brand-summary.component.scss"]
})
export class BrandSummaryComponent extends BaseComponentDirective implements OnInit {
  @Input()
  brand: BrandInterface;

  constructor() {
    super();
  }

  get logo(): string {
    return this.brand.logo || PLACEHOLDER;
  }

  ngOnInit(): void {}
}
