import { Injectable, NgZone } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Observable } from "rxjs";
import {
  AcquisitionType,
  DataSource,
  LicenseOptions,
  SolarSystemSubjectType,
  SubjectType
} from "@shared/interfaces/image.interface";
import { TranslateService } from "@ngx-translate/core";
import { BortleScale } from "@shared/interfaces/deep-sky-acquisition.interface";

@Injectable({
  providedIn: "root"
})
export class ImageService extends BaseService {
  public constructor(
    public readonly loadingService: LoadingService,
    public readonly windowRef: WindowRefService,
    public readonly zone: NgZone,
    public readonly translateService: TranslateService
  ) {
    super(loadingService);
  }

  public humanizeSubjectType(value: SubjectType): string {
    switch (value) {
      case SubjectType.DEEP_SKY:
        return this.translateService.instant("Deep sky object or field");
      case SubjectType.SOLAR_SYSTEM:
        return this.translateService.instant("Solar system body or event");
      case SubjectType.WIDE_FIELD:
        return this.translateService.instant("Extremely wide field");
      case SubjectType.STAR_TRAILS:
        return this.translateService.instant("Star trails");
      case SubjectType.NORTHERN_LIGHTS:
        return this.translateService.instant("Northern lights");
      case SubjectType.NOCTILUCENT_CLOUDS:
        return this.translateService.instant("Noctilucent clouds");
      case SubjectType.LANDSCAPE:
        return this.translateService.instant("Landscape");
      case SubjectType.ARTIFICIAL_SATELLITE:
        return this.translateService.instant("Artificial satellite");
      case SubjectType.GEAR:
        return this.translateService.instant("Equipment");
      case SubjectType.OTHER:
        return this.translateService.instant("Other");
    }
  }

  humanizeSolarSystemSubjectType(value: SolarSystemSubjectType): string {
    switch (value) {
      case SolarSystemSubjectType.SUN:
        return this.translateService.instant("Sun");
      case SolarSystemSubjectType.MOON:
        return this.translateService.instant("Earth's Moon");
      case SolarSystemSubjectType.MERCURY:
        return this.translateService.instant("Mercury");
      case SolarSystemSubjectType.VENUS:
        return this.translateService.instant("Venus");
      case SolarSystemSubjectType.MARS:
        return this.translateService.instant("Mars");
      case SolarSystemSubjectType.JUPITER:
        return this.translateService.instant("Jupiter");
      case SolarSystemSubjectType.SATURN:
        return this.translateService.instant("Saturn");
      case SolarSystemSubjectType.URANUS:
        return this.translateService.instant("Uranus");
      case SolarSystemSubjectType.NEPTUNE:
        return this.translateService.instant("Neptune");
      case SolarSystemSubjectType.MINOR_PLANET:
        return this.translateService.instant("Minor planet");
      case SolarSystemSubjectType.COMET:
        return this.translateService.instant("Comet");
      case SolarSystemSubjectType.OCCULTATION:
        return this.translateService.instant("Occultation");
      case SolarSystemSubjectType.CONJUNCTION:
        return this.translateService.instant("Conjunction");
      case SolarSystemSubjectType.PARTIAL_LUNAR_ECLIPSE:
        return this.translateService.instant("Partial lunar eclipse");
      case SolarSystemSubjectType.TOTAL_LUNAR_ECLIPSE:
        return this.translateService.instant("Total lunar eclipse");
      case SolarSystemSubjectType.PARTIAL_SOLAR_ECLIPSE:
        return this.translateService.instant("Partial solar eclipse");
      case SolarSystemSubjectType.ANULAR_SOLAR_ECLIPSE:
        return this.translateService.instant("Anular solar eclipse");
      case SolarSystemSubjectType.TOTAL_SOLAR_ECLIPSE:
        return this.translateService.instant("Total solar eclipse");
      case SolarSystemSubjectType.METEOR_SHOWER:
        return this.translateService.instant("Meteor shower");
      case SolarSystemSubjectType.OTHER:
        return this.translateService.instant("Other");
      default:
        return value;
    }
  }

  humanizeDataSource(value: DataSource): string {
    switch (value) {
      case DataSource.BACKYARD:
        return this.translateService.instant("Backyard");
      case DataSource.TRAVELLER:
        return this.translateService.instant("Traveller");
      case DataSource.OWN_REMOTE:
        return this.translateService.instant("Own remote observatory");
      case DataSource.AMATEUR_HOSTING:
        return this.translateService.instant("Amateur hosting facility");
      case DataSource.PUBLIC_AMATEUR_DATA:
        return this.translateService.instant("Public amateur data");
      case DataSource.PRO_DATA:
        return this.translateService.instant("Professional, scientific grade data");
      case DataSource.MIX:
        return this.translateService.instant("Mix of multiple sources");
      case DataSource.OTHER:
        return this.translateService.instant("None of the above");
      case DataSource.UNKNOWN:
        return this.translateService.instant("Unknown");
      default:
        return this.translateService.instant("Unknown");
    }
  }

  humanizeBortleScale(value: BortleScale): string {
    switch (value) {
      case BortleScale.ONE:
        return this.translateService.instant("1 - Excellent dark-site sky (BLACK)");
      case BortleScale.TWO:
        return this.translateService.instant("2 - Typical truly dark site (GRAY)");
      case BortleScale.THREE:
        return this.translateService.instant("3 - Rural sky (BLUE)");
      case BortleScale.FOUR:
        return this.translateService.instant("4 - Rural/suburban transition (GREEN/YELLOW)");
      case BortleScale.FOUR_POINT_FIVE:
        return this.translateService.instant("4.5 - Semi-Suburban/Transition sky (YELLOW)");
      case BortleScale.FIVE:
        return this.translateService.instant("5 - Suburban sky (ORANGE)");
      case BortleScale.SIX:
        return this.translateService.instant("6 - Bright suburban sky (RED)");
      case BortleScale.SEVEN:
        return this.translateService.instant("7 - Suburban/urban transition or Full Moon (RED)");
      case BortleScale.EIGHT:
        return this.translateService.instant("8 - City sky (WHITE)");
      case BortleScale.NINE:
        return this.translateService.instant("9 - Inner city sky (WHITE)");
      default:
        return this.translateService.instant("Unknown");
    }
  }

  humanizeLicenseOption(value: LicenseOptions): string {
    switch (value) {
      case LicenseOptions.ALL_RIGHTS_RESERVED:
        return this.translateService.instant("None (All rights reserved)");
      case LicenseOptions.ATTRIBUTION_NON_COMMERCIAL_SHARE_ALIKE:
        return this.translateService.instant("Attribution-NonCommercial-ShareAlike Creative Commons");
      case LicenseOptions.ATTRIBUTION_NON_COMMERCIAL:
        return this.translateService.instant("Attribution-NonCommercial Creative Commons");
      case LicenseOptions.ATTRIBUTION_NON_COMMERCIAL_NO_DERIVS:
        return this.translateService.instant("Attribution-NonCommercial-NoDerivs Creative Commons");
      case LicenseOptions.ATTRIBUTION:
        return this.translateService.instant("Attribution Creative Commons");
      case LicenseOptions.ATTRIBUTION_SHARE_ALIKE:
        return this.translateService.instant("Attribution-ShareAlike Creative Commons");
      case LicenseOptions.ATTRIBUTION_NO_DERIVS:
        return this.translateService.instant("Attribution-NoDerivs Creative Commons");
      default:
        return this.translateService.instant("Unknown");
    }
  }

  humanizeAcquisitionType(value: AcquisitionType): string {
    switch (value) {
      case AcquisitionType.REGULAR:
        return this.translateService.instant("Regular (e.g. medium/long exposure with a CCD or DSLR)");
      case AcquisitionType.EAA:
        return this.translateService.instant(
          "Electronically-Assisted Astronomy (EAA, e.g. based on a live video feed)"
        );
      case AcquisitionType.LUCKY:
        return this.translateService.instant("Lucky imaging (e.g. based on short exposures)");
      case AcquisitionType.DRAWING:
        return this.translateService.instant("Drawing/Sketch");
      case AcquisitionType.OTHER:
        return this.translateService.instant("Other/Unknown");
    }
  }

  loadImageFile(url: string, progressCallback: (progress: number) => void): Observable<string> {
    return new Observable<string>(observer => {
      const xhr = new XMLHttpRequest();
      const nativeWindow = this.windowRef.nativeWindow;
      let notifiedNotComputable = false;

      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";

      xhr.onprogress = event => {
        this.zone.run(() => {
          if (event.lengthComputable) {
            const progress: number = (event.loaded / event.total) * 100;
            progressCallback(progress);
          } else {
            if (!notifiedNotComputable) {
              notifiedNotComputable = true;
              progressCallback(-1);
            }
          }
        });
      };

      xhr.onloadend = () => {
        this.zone.run(() => {
          if (!xhr.status.toString().match(/^2/)) {
            // Try a more traditional approach.
            const image = new Image();
            image.onload = () => {
              observer.next(url);
              observer.complete();
            };
            image.src = url;
            return;
          }

          if (!notifiedNotComputable) {
            progressCallback(100);
          }

          const options: any = {};
          const headers = xhr.getAllResponseHeaders();
          const m = headers.match(/^Content-Type:\s*(.*?)$/im);

          if (m && m[1]) {
            options.type = m[1];
          }

          const blob = new Blob([xhr.response], options);

          observer.next((nativeWindow as any).URL.createObjectURL(blob));
          observer.complete();
        });
      };

      xhr.send();
    });
  }
}
