import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, switchMap } from "rxjs";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { LoadContentTypeById } from "@app/store/actions/content-type.actions";
import { selectContentTypeById } from "@app/store/selectors/app/content-type.selectors";
import { filter, take } from "rxjs/operators";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";

@Injectable({
  providedIn: "root"
})
export class EquipmentMarketplaceService extends BaseService {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService
  ) {
    super(loadingService);
  }

  getEquipmentItem$(lineItem: MarketplaceLineItemInterface): Observable<EquipmentItem> {
    const contentTypePayload = { id: lineItem.itemContentType };

    this.store$.dispatch(new LoadContentTypeById(contentTypePayload));

    return this.store$.select(selectContentTypeById, contentTypePayload).pipe(
      filter(contentType => !!contentType),
      take(1),
      switchMap((contentType: ContentTypeInterface) => {
          const payload = {
            id: lineItem.itemObjectId,
            type: EquipmentItemType[contentType.model.toUpperCase()]
          };

          this.store$.dispatch(new LoadEquipmentItem(payload));
          return this.store$.select(selectEquipmentItem, payload).pipe(
            filter(equipmentItem => !!equipmentItem),
            take(1)
          );
        }
      )
    );
  }
}
