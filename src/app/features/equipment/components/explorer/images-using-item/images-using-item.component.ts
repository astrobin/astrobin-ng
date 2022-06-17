import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { map, take } from "rxjs/operators";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { Observable } from "rxjs";
import { BrandInterface } from "@features/equipment/types/brand.interface";

@Component({
  selector: "astrobin-images-using-equipment-item",
  templateUrl: "./images-using-item.component.html",
  styleUrls: ["../objects-using-item.component.scss"]
})
export class ImagesUsingItemComponent extends BaseComponentDirective implements OnChanges {
  readonly MAX_IMAGES = 24;
  readonly ImageAlias = ImageAlias;

  @Input()
  images: ImageInterface[];

  @Input()
  item: EquipmentItem;

  @Input()
  brand: BrandInterface;

  searchUrl: string;

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes.item && changes.item.currentValue) {
      this.setSearchUrlForItem$(this.item);
    }

    if (!!changes.brand && changes.brand.currentValue) {
      this.setSearchUrlForBrand(this.brand);
    }
  }

  setSearchUrlForItem$(item: EquipmentItem): void {
    this.equipmentItemService
      .getFullDisplayName$(item)
      .pipe(
        take(1),
        map(name => `${this.classicRoutesService.SEARCH}?d=i&sort=-likes&q="${encodeURIComponent(name)}"`)
      )
      .subscribe(url => (this.searchUrl = url));
  }

  setSearchUrlForBrand(brand: BrandInterface): void {
    this.searchUrl = `${this.classicRoutesService.SEARCH}?d=i&sort=-likes&q="${encodeURIComponent(brand.name)}"`;
  }
}
