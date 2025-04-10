import { Component, Input } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { PricingInterface } from "@features/subscriptions/interfaces/pricing.interface";
import { RecurringUnit } from "@features/subscriptions/types/recurring.unit";
import type { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { InformationDialogComponent } from "@shared/components/misc/information-dialog/information-dialog.component";

@Component({
  selector: "astrobin-price",
  templateUrl: "./price.component.html",
  styleUrls: ["./price.component.scss"]
})
export class PriceComponent extends BaseComponentDirective {
  @Input()
  pricing: { [recurringUnit: string]: PricingInterface };

  @Input()
  currency: string;

  @Input()
  recurringUnit: RecurringUnit;

  @Input()
  showRecurringUnit = true;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  get recurringUnitLabel(): string {
    if (this.recurringUnit === RecurringUnit.MONTHLY) {
      return this.translateService.instant("month");
    } else if (this.recurringUnit === RecurringUnit.YEARLY) {
      return this.translateService.instant("year");
    }

    return "";
  }

  negativePriceInfo(): void {
    const modal = this.modalService.open(InformationDialogComponent);
    const componentInstance: InformationDialogComponent = modal.componentInstance;
    componentInstance.message = this.translateService.instant(
      "If you switch to this pricing model, the cost will be temporarily covered by your positive balance."
    );
  }

  proratedPriceInfo(): void {
    const modal = this.modalService.open(InformationDialogComponent);
    const componentInstance: InformationDialogComponent = modal.componentInstance;
    componentInstance.message = this.translateService.instant(
      "This price is prorated for the remaining days of your current subscription. This means that you will pay " +
        "the reduced amount on your next billing date, and the full amount on the following billing dates."
    );
  }
}
