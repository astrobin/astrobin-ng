import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import {
  MarketplaceListingInterface,
  MarketplaceListingType
} from "@features/equipment/types/marketplace-listing.interface";
import { GoogleMapsService } from "@shared/services/google-maps/google-maps.service";
import { CountryService } from "@shared/services/country.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";

@Component({
  selector: "astrobin-marketplace-listing",
  templateUrl: "./marketplace-listing.component.html",
  styleUrls: ["./marketplace-listing.component.scss"]
})
export class MarketplaceListingComponent extends BaseComponentDirective implements OnInit, OnChanges {
  readonly MarketplaceListingType = MarketplaceListingType;

  @Input()
  listing: MarketplaceListingInterface;

  @Input()
  previewMode = false;

  @ViewChild("map")
  mapElement: ElementRef;

  map: any;
  mapCircle: any;
  mapLoading = true;
  googleMapsAvailable = false;

  constructor(
    public readonly store$: Store<State>,
    public readonly googleMapsService: GoogleMapsService,
    public readonly countryService: CountryService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly utilsService: UtilsService,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.googleMapsAvailable = !!this.googleMapsService.maps;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.listing && changes.listing.currentValue) {
      const listing: MarketplaceListingInterface = changes.listing.currentValue;
      const previous: MarketplaceListingInterface = changes.listing.previousValue;

      if (
        changes.listing.isFirstChange() ||
        (listing.latitude !== previous.latitude && listing.longitude !== previous.longitude)
      ) {
        this.utilsService.delay(100).subscribe(() => {
          this.initMap(listing.latitude, listing.longitude);
        });
      }
    }
  }

  initMap(latitude: number, longitude: number) {
    if (latitude === undefined || longitude === undefined) {
      return;
    }

    if (!this.googleMapsAvailable) {
      return;
    }

    const randomOffset = maxOffset => Math.random() * maxOffset - maxOffset / 2;

    const location = new this.googleMapsService.maps.LatLng(
      latitude + randomOffset(0.01), // 0.01 degrees ~ 1.11 km,
      longitude + randomOffset(0.01)
    );

    const mapOptions = {
      center: location,
      zoom: 12,
      mapTypeId: this.googleMapsService.maps.MapTypeId.ROADMAP,
      draggable: true,
      zoomControl: true,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      streetViewControl: false,
      mapTypeControl: false
    };

    if (!!this.map) {
      delete this.map;
    }

    if (!!this.mapCircle) {
      delete this.mapCircle;
    }

    this.map = new this.googleMapsService.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.mapCircle = new this.googleMapsService.maps.Circle({
      center: location,
      radius: 1000,
      fillColor: "#ADD8E6", // Light blue
      fillOpacity: 0.6,
      strokeColor: "#ADD8E6", // Light blue
      strokeOpacity: 0.8,
      strokeWeight: 2,
      map: this.map
    });

    this.googleMapsService.maps.event.addListenerOnce(this.map, "idle", () => {
      this.mapLoading = false;
    });
  }
}
