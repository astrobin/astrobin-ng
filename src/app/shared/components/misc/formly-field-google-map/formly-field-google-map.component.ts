import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { GoogleMapsService } from "@shared/services/google-maps/google-maps.service";
import { google } from "@google/maps";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-formly-field-image-cropper",
  templateUrl: "./formly-field-google-map.component.html",
  styleUrls: ["./formly-field-google-map.component.scss"]
})
export class FormlyFieldGoogleMapComponent extends FieldType implements AfterViewInit {
  @ViewChild("map") mapElement: any;

  search: string;

  map: google.maps.Map;

  tilesLoaded = false;

  constructor(
    public readonly googleMapsService: GoogleMapsService,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.getLocation()
      .pipe(take(1))
      .subscribe(coordinates => {
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

        const marker = new this.googleMapsService.maps.Marker({
          position: location,
          map: this.map
        });

        this.googleMapsService.maps.event.addListener(this.map, "center_changed", () => {
          // 0.25 seconds after the center of the map has changed, set the marker position again.
          this.utilsService.delay(250).subscribe(() => {
            const center = this.map.getCenter();
            marker.setPosition(center);
            this.formControl.setValue(center);
            this.updateSearch();
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
        this.updateSearch();
      });
  }

  updateSearch() {
    const geocoder = this.googleMapsService.createGeocoder();
    const lat = this.formControl.value.lat();
    const lng = this.formControl.value.lng();

    if (!lat || !lng) {
      return;
    }

    const location = { lat: parseFloat(lat), lng: parseFloat(lng) };

    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK") {
        this.search = results[0].formatted_address;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  searchChanged(event: Event) {
    event.stopPropagation();

    const geocoder = this.googleMapsService.createGeocoder();
    geocoder.geocode({ address: this.search }, (results, status) => {
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
        observer.next({ latitude: 40.78, longitude: -73.96 });
        observer.complete();
      };

      if (this.props.latitude && this.props.longitude) {
        success({
          latitude: this.props.latitude,
          longitude: this.props.longitude
        });
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
}
