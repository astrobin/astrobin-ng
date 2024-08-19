import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { Observable, Subject } from "rxjs";
import { debounceTime, take } from "rxjs/operators";
import { GoogleMapsService } from "@shared/services/google-maps/google-maps.service";
import { google } from "@google/maps";
import { UtilsService } from "@shared/services/utils/utils.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "astrobin-formly-field-image-cropper",
  templateUrl: "./formly-field-google-map.component.html",
  styleUrls: ["./formly-field-google-map.component.scss"]
})
export class FormlyFieldGoogleMapComponent extends FieldType implements OnInit, AfterViewInit {
  @ViewChild("map") mapElement: any;

  search: string;

  map: google.maps.Map;
  geocoder: google.maps.Geocoder;
  lastCenter: google.maps.LatLng;
  tilesLoaded = false;
  isCypress = false; // Cypress doesn't support Google Maps due to RefererNotAllowedMapError
  isLocalhost = false; // Same as above

  private updateSearchSubject = new Subject<void>();
  private geocodeCache = new Map<string, string>();

  constructor(
    public readonly googleMapsService: GoogleMapsService,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: any
  ) {
    super();

    this.updateSearchSubject.pipe(
      debounceTime(1000)
    ).subscribe(() => {
      this.updateSearch();
    });
  }

  ngOnInit(): void {
    this.isCypress = isPlatformBrowser(this.platformId) && Object.keys(this.windowRefService.nativeWindow).indexOf("Cypress") > -1;
    this.isLocalhost = isPlatformBrowser(this.platformId) && this.windowRefService.nativeWindow.location.hostname === "localhost";
  }

  ngAfterViewInit(): void {
    this.getLocation()
      .pipe(take(1))
      .subscribe(coordinates => {
        if (!this.googleMapsService.maps) {
          this.popNotificationsService.error(
            this.translateService.instant(
              "Google Maps API could not be loaded. Please make sure you're not blocking it."
            )
          );
          return;
        }
        const location = new this.googleMapsService.maps.LatLng(coordinates.latitude, coordinates.longitude);
        const mapOptions = {
          center: new this.googleMapsService.maps.LatLng(location.lat(), location.lng()),
          zoom: 13,
          mapTypeId: this.googleMapsService.maps.MapTypeId.ROADMAP,
          scrollwheel: this.props.scrollwheel === undefined ? true : this.props.scrollwheel,
          disableDoubleClickZoom: true,
          streetViewControl: false,
          mapTypeControl: false
        };

        this.map = new this.googleMapsService.maps.Map(this.mapElement.nativeElement, mapOptions);

        if ((this.isCypress || this.isLocalhost) && this.props.mapError !== undefined) {
          this.props.mapError();
          this.changeDetectorRef.detectChanges();
        }

        const marker = new this.googleMapsService.maps.Marker({
          position: location,
          map: this.map
        });

        this.googleMapsService.maps.event.addListener(this.map, "center_changed", () => {
          // 0.25 seconds after the center of the map has changed, set the marker position again.
          this.utilsService.delay(250).subscribe(() => {
            const center = this.map.getCenter();
            if (this.lastCenter && this.calculateDistance(this.lastCenter, center) < 0.5) {
              return;
            }
            this.lastCenter = center;
            marker.setPosition(center);
            this.formControl.setValue(center);
            this.updateSearchSubject.next();
          });
        });

        this.googleMapsService.maps.event.addListenerOnce(this.map, "tilesloaded", () => {
          this.tilesLoaded = true;
          if (this.props.mapReady !== undefined) {
            this.props.mapReady();
          }
          this.changeDetectorRef.detectChanges();
        });

        this.formControl.setValue(this.map.getCenter());
        this.updateSearchSubject.next();
      });
  }

  updateSearch() {
    const value = this.formControl.value;

    if (!value) {
      return;
    }

    const lat = value.lat();
    const lng = value.lng();

    if (!lat || !lng) {
      return;
    }

    const location = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const cacheKey = `${location.lat},${location.lng}`;

    if (this.geocodeCache.has(cacheKey)) {
      this.search = this.geocodeCache.get(cacheKey);
      this.changeDetectorRef.detectChanges();
      return;
    }

    if (!this.geocoder) {
      this.geocoder = this.googleMapsService.createGeocoder();
    }

    this.geocoder.geocode({ location }, (results, status) => {
      if (status === "OK") {
        const address = results[0].formatted_address;
        this.search = address;
        this.geocodeCache.set(cacheKey, address);
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  searchChanged(event: Event) {
    event.stopPropagation();

    if (!this.geocoder) {
      this.geocoder = this.googleMapsService.createGeocoder();
    }

    this.geocoder.geocode({ address: this.search }, (results, status) => {
      if (status === "OK") {
        this.map.setCenter(results[0].geometry.location);
        this.formControl.setValue(results[0].geometry.location);
      }
    });
  }

  getLocation(): Observable<{ latitude: number; longitude: number }> {
    return new Observable<{ latitude: number; longitude: number }>(observer => {
      const success = position => {
        observer.next(position.coords);
        observer.complete();
      };

      const error = () => {
        this.popNotificationsService.error(
          this.translateService.instant(
            "AstroBin could not determine your location, so the location field could not be prefilled."
          )
        );
        observer.next({ latitude: null, longitude: null });
        observer.complete();
      };

      if (this.props.latitude && this.props.longitude) {
        success({
          coords: {
            latitude: this.props.latitude,
            longitude: this.props.longitude
          }
        });
        return;
      }

      if (navigator.geolocation) {
        const options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(success, error, options);
      } else {
        error();
      }
    });
  }

  calculateDistance(center1, center2) {
    const lat1 = center1.lat();
    const lng1 = center1.lng();
    const lat2 = center2.lat();
    const lng2 = center2.lng();
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in km
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}
