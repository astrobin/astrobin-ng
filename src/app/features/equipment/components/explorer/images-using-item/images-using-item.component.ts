import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { GetImages, LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { selectEquipmentItem, selectImagesUsingEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { Observable } from "rxjs";

@Component({
  selector: "astrobin-images-using-equipment-item",
  templateUrl: "./images-using-item.component.html",
  styleUrls: ["../objects-using-item.component.scss"]
})
export class ImagesUsingItemComponent extends BaseComponentDirective implements OnChanges, OnInit {
  readonly MAX_IMAGES = 49;
  readonly ImageAlias = ImageAlias;

  @Input()
  itemType: EquipmentItemType;

  @Input()
  itemId: EquipmentItemBaseInterface["id"];

  item: EquipmentItem;

  images: ImageInterface[];

  searchUrl: string;

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.store$
      .select(selectImagesUsingEquipmentItem, { itemType: this.itemType, itemId: this.itemId })
      .pipe(
        takeUntil(this.destroyed$),
        filter(imagesUsingEquipmentItem => !!imagesUsingEquipmentItem)
      )
      .subscribe(imagesUsingEquipmentItem => {
        this.images = imagesUsingEquipmentItem.images.slice(0, this.MAX_IMAGES);
      });

    this.store$
      .select(selectEquipmentItem, { type: this.itemType, id: this.itemId })
      .pipe(
        takeUntil(this.destroyed$),
        filter(item => !!item)
      )
      .subscribe(item => {
        this.item = item;
        this.getSearchUrl$(item)
          .pipe(take(1))
          .subscribe(searchUrl => (this.searchUrl = searchUrl));
      });
  }

  ngOnChanges(): void {
    this.item = undefined;
    this.images = undefined;

    this.store$.dispatch(new GetImages({ itemType: this.itemType, itemId: this.itemId }));
    this.store$.dispatch(new LoadEquipmentItem({ type: this.itemType, id: this.itemId }));
  }

  getSearchUrl$(item: EquipmentItem): Observable<string> {
    return this.equipmentItemService.getFullDisplayName$(item).pipe(
      take(1),
      map(name => `${this.classicRoutesService.SEARCH}?d=i&sort=-likes&q="${encodeURIComponent(name)}"`)
    );
  }
}
