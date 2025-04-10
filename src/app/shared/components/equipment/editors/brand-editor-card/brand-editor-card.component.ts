import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import type { MainState } from "@app/store/state";
import { LoadingService } from "@core/services/loading.service";
import type { CreateBrandSuccess } from "@features/equipment/store/equipment.actions";
import { CreateBrand, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import type { BrandInterface } from "@features/equipment/types/brand.interface";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { map, take } from "rxjs/operators";

@Component({
  selector: "astrobin-brand-editor-card",
  templateUrl: "./brand-editor-card.component.html",
  styleUrls: ["./brand-editor-card.component.scss"]
})
export class BrandEditorCardComponent extends BaseComponentDirective {
  @Input()
  form: FormGroup = new FormGroup({});

  @Input()
  model: Partial<BrandInterface>;

  @Input()
  name: string;

  @Input()
  disabled: boolean;

  @Output()
  brand = new EventEmitter<BrandInterface>();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }

  createBrand() {
    const { ...brand } = this.form.value;
    this.loadingService.setLoading(true);
    this.store$.dispatch(new CreateBrand({ brand }));
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.CREATE_BRAND_SUCCESS),
        take(1),
        map((action: CreateBrandSuccess) => action.payload.brand)
      )
      .subscribe(newBrand => {
        this.brand.emit(newBrand);
        this.loadingService.setLoading(false);
      });
  }
}
