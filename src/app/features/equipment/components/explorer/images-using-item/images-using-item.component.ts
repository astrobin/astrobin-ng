import { Component, Input, OnChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { GetImages } from "@features/equipment/store/equipment.actions";
import { selectImagesUsingEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { filter, takeUntil } from "rxjs/operators";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Component({
  selector: "astrobin-images-using-equipment-item",
  templateUrl: "./images-using-item.component.html",
  styleUrls: ["../objects-using-item.component.scss"]
})
export class ImagesUsingItemComponent extends BaseComponentDirective implements OnChanges {
  ImageAlias = ImageAlias;

  @Input()
  itemType: EquipmentItemType;

  @Input()
  itemId: EquipmentItemBaseInterface["id"];

  images: ImageInterface[];

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  ngOnChanges(): void {
    const data = { itemType: this.itemType, itemId: this.itemId };

    this.images = undefined;

    this.store$
      .select(selectImagesUsingEquipmentItem, data)
      .pipe(
        takeUntil(this.destroyed$),
        filter(imagesUsingEquipmentItem => !!imagesUsingEquipmentItem)
      )
      .subscribe(imagesUsingEquipmentItem => {
        this.images = imagesUsingEquipmentItem.images.slice(0, 49);
      });

    this.store$.dispatch(new GetImages(data));
  }
}
