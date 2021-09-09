import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { Store } from "@ngrx/store";

export const PLACEHOLDER = "https://via.placeholder.com/50.png/000/fff?text=?";

@Component({
  selector: "astrobin-brand-summary",
  templateUrl: "./brand-summary.component.html",
  styleUrls: ["./brand-summary.component.scss"]
})
export class BrandSummaryComponent extends BaseComponentDirective implements OnInit {
  @Input()
  brand: BrandInterface;

  constructor(public readonly store$: Store) {
    super(store$);
  }

  get logo(): string {
    return (this.brand.logo as string) || PLACEHOLDER;
  }

  ngOnInit(): void {}
}
