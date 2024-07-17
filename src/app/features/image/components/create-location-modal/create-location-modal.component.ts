import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { AuthActionTypes, UpdateCurrentUserProfileSuccess } from "@features/account/store/auth.actions";
import { map, take, tap } from "rxjs/operators";
import { Actions, ofType } from "@ngrx/effects";
import { CreateLocation } from "@app/store/actions/location.actions";
import { LocationInterface } from "@shared/interfaces/location.interface";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { GoogleMapsService } from "@shared/services/google-maps/google-maps.service";

@Component({
  selector: "astrobin-create-location-modal",
  templateUrl: "./create-location-modal.component.html",
  styleUrls: ["./create-location-modal.component.scss"]
})
export class CreateLocationModalComponent extends BaseComponentDirective implements OnInit {
  form = new FormGroup({});
  fields: FormlyFieldConfig[];
  model = {};
  mapReady = false;
  mapError = false;
  geocoder = this.googleMapsService.createGeocoder();

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService,
    public readonly googleMapsService: GoogleMapsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.store$
      .select(selectApp)
      .pipe(
        take(1),
        map(state => state.createLocationAddTag),
        tap(name => {
          this.fields = [
            {
              type: "input",
              wrappers: ["default-wrapper"],
              id: "name",
              key: "name",
              defaultValue: name,
              props: {
                label: this.translateService.instant("Name"),
                placeholder: this.translateService.instant("e.g. 'Home observatory'"),
                required: true
              }
            },
            {
              type: "google-map",
              id: "google-map",
              key: "google-map",
              props: {
                required: true,
                height: 300,
                mapReady: () => {
                  this.mapReady = true;
                },
                mapError: () => {
                  this.mapError = true;
                },
                description: this.translateService.instant("Move the map until the marker points at right location")
              }
            },
            {
              type: "custom-number",
              id: "altitude",
              key: "altitude",
              wrappers: ["default-wrapper"],
              props: {
                required: true,
                label: this.translateService.instant("Altitude"),
                description: this.translateService.instant("Meters above sea level"),
                step: 1,
                min: -10984, // Bottom of Marianna Trench,
                max: 8848 // Mt. Everest
              }
            }
          ];
        })
      )
      .subscribe();
  }

  save(): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loadingService.setLoading(true);

    const latitude = (this.form.get("google-map").value as any).lat();
    const longitude = (this.form.get("google-map").value as any).lng();

    this.getGeolocation(latitude, longitude).subscribe(result => {
      if (result === null) {
        this.modal.close(null);
        this.loadingService.setLoading(false);
        return;
      }

      const location = this.buildLocationObject(
        (this.form.value as any).name,
        latitude,
        longitude,
        (this.form.value as any).aititude,
        result.city,
        result.state,
        result.country
      );

      this.store$.dispatch(new CreateLocation(location));

      this.actions$
        .pipe(
          ofType(AuthActionTypes.UPDATE_CURRENT_USER_PROFILE_SUCCESS),
          take(1),
          map((action: UpdateCurrentUserProfileSuccess) => action.payload),
          tap(userProfile => {
            this.modal.close(userProfile.locations[userProfile.locations.length - 1]);
            this.loadingService.setLoading(false);
          })
        )
        .subscribe();
    });
  }

  buildLocationObject(
    name: string,
    latitude: number,
    longitude: number,
    altitude: number,
    city: string,
    state: string,
    country: string
  ): Omit<LocationInterface, "id"> {
    const latitudeDms = this.convertToDms(latitude, "latitude");
    const longitudeDms = this.convertToDms(longitude, "longitude");

    return {
      name,
      lat_deg: latitudeDms.degrees,
      lat_min: latitudeDms.minutes,
      lat_sec: Math.round(latitudeDms.seconds),
      lat_side: latitudeDms.direction as "N" | "S",
      lon_deg: longitudeDms.degrees,
      lon_min: longitudeDms.minutes,
      lon_sec: Math.round(longitudeDms.seconds),
      lon_side: longitudeDms.direction as "W" | "E",
      altitude,
      city,
      state,
      country
    };
  }

  convertToDms(
    decimalDegrees,
    type: "latitude" | "longitude"
  ): { degrees: number; minutes: number; seconds: number; direction: "N" | "S" | "W" | "E" } {
    /* eslint-disable no-bitwise */

    const direction = decimalDegrees < 0 ? (type === "longitude" ? "W" : "S") : type === "longitude" ? "E" : "N";

    const absoluteDecimalDegrees = Math.abs(decimalDegrees);
    const degrees = absoluteDecimalDegrees | 0;
    const fraction = absoluteDecimalDegrees - degrees;
    const minutes = (fraction * 60) | 0;
    let seconds = fraction * 3600 - minutes * 60;
    // Round it to 2 decimal points.
    seconds = Math.round(seconds * 100) / 100;

    return {
      degrees,
      minutes,
      seconds,
      direction
    };
  }

  getGeolocation(latitude: number, longitude: number): Observable<{ city; state; country }> {
    return new Observable<{ city; state; country }>(observer => {
      const latLng = new this.googleMapsService.maps.LatLng(latitude, longitude);
      if (this.mapError) {
        observer.next(null);
        observer.complete();
        return;
      }

      this.geocoder.geocode({ latLng } as any, (results, status) => {
        if (status === this.googleMapsService.maps.GeocoderStatus.OK) {
          if (results[1]) {
            observer.next({
              city: this.getGeolocationComponent(results[1], "locality"),
              state: this.getGeolocationComponent(results[1], "administrative_area_level_1"),
              country: this.getGeolocationComponent(results[1], "country")
            });
          } else {
            observer.next(null);
          }
        } else {
          observer.next(null);
        }

        observer.complete();
      });
    });
  }

  // @ts-ignore
  getGeolocationComponent(geolocation: google.maps.GeocoderResult, type: string): string {
    if (!geolocation) {
      return null;
    }

    if (!geolocation.address_components) {
      return null;
    }

    for (const component of geolocation.address_components) {
      if (component.types.indexOf(type) > -1) {
        return component.short_name;
      }
    }

    return null;
  }
}
