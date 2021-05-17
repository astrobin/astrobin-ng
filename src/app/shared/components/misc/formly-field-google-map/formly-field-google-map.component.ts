import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { GoogleMapsService } from "@shared/services/google-maps/google-maps.service";

@Component({
  selector: "astrobin-formly-field-image-cropper",
  templateUrl: "./formly-field-google-map.component.html",
  styleUrls: ["./formly-field-google-map.component.scss"]
})
export class FormlyFieldGoogleMapComponent extends FieldType implements AfterViewInit {
  @ViewChild("map") mapElement: any;

  map: google.maps.Map;

  tilesLoaded = false;

  constructor(public readonly googleMapsService: GoogleMapsService) {
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
          mapTypeId: this.googleMapsService.maps.MapTypeId.ROADMAP
        };

        this.map = new this.googleMapsService.maps.Map(this.mapElement.nativeElement, mapOptions);

        const marker = new this.googleMapsService.maps.Marker({
          position: location,
          map: this.map
        });

        this.googleMapsService.maps.event.addListener(this.map, "center_changed", () => {
          // 0.1 seconds after the center of the map has changed, set the marker position again.
          window.setTimeout(() => {
            const center = this.map.getCenter();
            marker.setPosition(center);
            this.formControl.setValue(center);
          }, 250);
        });

        this.googleMapsService.maps.event.addListenerOnce(this.map, "tilesloaded", () => {
          this.tilesLoaded = true;
          if (this.to.mapReady !== undefined) {
            this.to.mapReady();
          }
        });

        this.formControl.setValue(this.map.getCenter());
      });
  }

  getLocation(): Observable<Coordinates> {
    return new Observable<Coordinates>(observer => {
      const success = position => {
        observer.next(position.coords);
        observer.complete();
      };

      const error = () => {
        observer.next({ latitude: 40.78, longitude: -73.96 } as Coordinates);
        observer.complete();
      };

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
