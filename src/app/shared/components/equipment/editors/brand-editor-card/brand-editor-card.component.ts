import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { FormGroup } from "@angular/forms";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { LoadingService } from "@shared/services/loading.service";
import { CreateBrand, CreateBrandSuccess, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
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
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }

  createBrand() {
    const { id, ...brand } = this.form.value;
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
