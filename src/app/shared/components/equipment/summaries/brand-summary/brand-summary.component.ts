import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { Store } from "@ngrx/store";

export const PLACEHOLDER = "/assets/images/brand-placeholder.png?v=2";

@Component({
  selector: "astrobin-brand-summary",
  templateUrl: "./brand-summary.component.html",
  styleUrls: ["./brand-summary.component.scss"]
})
export class BrandSummaryComponent extends BaseComponentDirective {
  @Input()
  brand: BrandInterface;

  constructor(public readonly store$: Store) {
    super(store$);
  }

  get logo(): string {
    return (this.brand.logo as string) || PLACEHOLDER;
  }
}
