import type { OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import type { MainState } from "@app/store/state";
import { EquipmentItemService } from "@core/services/equipment-item.service";
import { LoadingService } from "@core/services/loading.service";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import type { FindSimilarInBrandSuccess, GetOthersInBrandSuccess } from "@features/equipment/store/equipment.actions";
import {
  ApproveEquipmentItem,
  EquipmentActionTypes,
  FindSimilarInBrand,
  GetOthersInBrand
} from "@features/equipment/store/equipment.actions";
import type { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import type { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import type { Observable } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";

@Component({
  selector: "astrobin-approve-item-modal",
  templateUrl: "./approve-item-modal.component.html",
  styleUrls: ["./approve-item-modal.component.scss"]
})
export class ApproveItemModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    comment?: string;
  } = {
    comment: null
  };

  @Input()
  equipmentItem: EquipmentItemBaseInterface;

  similarItemsPreamble: string;
  similarItems$: Observable<EquipmentItemBaseInterface[]>;

  othersInBrand: EquipmentItem[] = [];

  consultHandbookMessage = this.translateService.instant(
    "Please consult the {{0}}AstroBin Equipment Moderator Handbook{{1}}.",
    {
      0: `<a href="https://welcome.astrobin.com/equipment-database-moderator-handbook" target="_blank">`,
      1: "</a>"
    }
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly equipmentApiService: EquipmentApiService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.fields = [
      {
        key: "comment",
        type: "textarea",
        id: "comment",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Comment"),
          required: false,
          rows: 4
        }
      }
    ];

    this.similarItemsPreamble =
      this.translateService.instant("Please DO NOT approve this item if it's a duplicate of another one!") +
      " " +
      this.translateService.instant("We found the following similar items from the same brand:");

    this._findSimilarItems();

    this.store$.dispatch(
      new GetOthersInBrand({
        brand: this.equipmentItem.brand,
        type: this.equipmentItemService.getType(this.equipmentItem),
        name: this.equipmentItem.name
      })
    );
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.GET_OTHERS_IN_BRAND_SUCCESS),
        map((action: GetOthersInBrandSuccess) => action.payload.items),
        take(1)
      )
      .subscribe(othersInBrand => {
        this.othersInBrand = othersInBrand;
      });
  }

  approve() {
    this.loadingService.setLoading(true);

    const comment: string = this.form.get("comment").value;

    this.store$.dispatch(
      new ApproveEquipmentItem({
        item: this.equipmentItem,
        comment
      })
    );

    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS),
        take(1),
        switchMap(editProposal =>
          this.equipmentApiService
            .releaseReviewerLock(this.equipmentItem.klass, this.equipmentItem.id)
            .pipe(map(() => editProposal))
        )
      )
      .subscribe(() => {
        this.loadingService.setLoading(false);
        this.modal.close();
      });
  }

  cancel() {
    this.loadingService.setLoading(true);

    this.equipmentApiService.releaseReviewerLock(this.equipmentItem.klass, this.equipmentItem.id).subscribe(() => {
      this.loadingService.setLoading(false);

      this.modal.dismiss();
    });
  }

  private _findSimilarItems() {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.equipmentItem);

    this.store$.dispatch(new FindSimilarInBrand({ brand: this.equipmentItem.brand, q: this.equipmentItem.name, type }));
    this.similarItems$ = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_SIMILAR_IN_BRAND_SUCCESS),
      map((action: FindSimilarInBrandSuccess) => action.payload.items),
      take(1)
    );
  }
}
