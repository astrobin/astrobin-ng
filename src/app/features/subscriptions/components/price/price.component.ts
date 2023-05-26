import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { PricingInterface } from "@features/subscriptions/interfaces/pricing.interface";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { State } from "@app/store/state";
import { RecurringUnit } from "@features/subscriptions/types/recurring.unit";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
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
    public readonly store$: Store<State>,
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
}
