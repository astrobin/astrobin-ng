import { Inject, Injectable, NgZone, PLATFORM_ID } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Observable, Observer, of } from "rxjs";
import { AcquisitionType, CelestialHemisphere, DataSource, FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface, LicenseOptions, ORIGINAL_REVISION_LABEL, SolarSystemSubjectType, SubjectType } from "@shared/interfaces/image.interface";
import { TranslateService } from "@ngx-translate/core";
import { BortleScale, DeepSkyAcquisitionInterface } from "@shared/interfaces/deep-sky-acquisition.interface";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { filter, map, take, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { isPlatformServer } from "@angular/common";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { ActiveToast } from "ngx-toastr";
import { select, Store } from "@ngrx/store";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { LoadImage, LoadImageFailure } from "@app/store/actions/image.actions";
import { MainState } from "@app/store/state";
import { UtilsService } from "@shared/services/utils/utils.service";

@Injectable({
  providedIn: "root"
})
export class ImageService extends BaseService {
  private _imageNotFoundNotification: ActiveToast<any>;

  public constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly windowRef: WindowRefService,
    public readonly zone: NgZone,
    public readonly translateService: TranslateService,
    public readonly http: HttpClient,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(loadingService);
  }

  public humanizeSubjectTypeShort(value: SubjectType): string {
    switch (value) {
      case SubjectType.DEEP_SKY:
        return this.translateService.instant("Deep sky");
      case SubjectType.SOLAR_SYSTEM:
        return this.translateService.instant("Solar system");
      case SubjectType.WIDE_FIELD:
        return this.translateService.instant("Wide field");
      case SubjectType.STAR_TRAILS:
        return this.translateService.instant("Star trails");
      case SubjectType.NORTHERN_LIGHTS:
        return this.translateService.instant("Northern lights");
      case SubjectType.NOCTILUCENT_CLOUDS:
        return this.translateService.instant("Noctilucent clouds");
      case SubjectType.LANDSCAPE:
        return this.translateService.instant("Landscape");
      case SubjectType.ARTIFICIAL_SATELLITE:
        return this.translateService.instant("Satellite");
      case SubjectType.GEAR:
        return this.translateService.instant("Equipment");
      case SubjectType.OTHER:
        return this.translateService.instant("Other");
    }
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

  getLicenseIcon(value: LicenseOptions): IconProp {
    switch (value) {
      case LicenseOptions.ALL_RIGHTS_RESERVED:
        return ["far", "copyright"];
      case LicenseOptions.ATTRIBUTION_NON_COMMERCIAL_SHARE_ALIKE:
        return ["fab", "creative-commons-sa"];
      case LicenseOptions.ATTRIBUTION_NON_COMMERCIAL:
        return ["fab", "creative-commons-nc"];
      case LicenseOptions.ATTRIBUTION_NON_COMMERCIAL_NO_DERIVS:
        return ["fab", "creative-commons-nd"];
      case LicenseOptions.ATTRIBUTION:
        return ["fab", "creative-commons"];
      case LicenseOptions.ATTRIBUTION_SHARE_ALIKE:
        return ["fab", "creative-commons-sa"];
      case LicenseOptions.ATTRIBUTION_NO_DERIVS:
        return ["fab", "creative-commons-nd"];
      default:
        return "copyright";
    }
  }

  getSubjectTypeIcon(value: SubjectType, solarSystemValue: SolarSystemSubjectType, color: "white" | "black"): string {
    let icon: string;

    if (solarSystemValue) {
      switch (solarSystemValue) {
        case SolarSystemSubjectType.SUN:
          icon = "sun";
          break;
        case SolarSystemSubjectType.MOON:
          icon = "moon";
          break;
        case SolarSystemSubjectType.MERCURY:
          icon = "mercury";
          break;
        case SolarSystemSubjectType.VENUS:
          icon = "venus";
          break;
        case SolarSystemSubjectType.MARS:
          icon = "mars";
          break;
        case SolarSystemSubjectType.JUPITER:
          icon = "jupiter";
          break;
        case SolarSystemSubjectType.SATURN:
          icon = "saturn";
          break;
        case SolarSystemSubjectType.URANUS:
          icon = "uranus";
          break;
        case SolarSystemSubjectType.NEPTUNE:
          icon = "neptune";
          break;
        case SolarSystemSubjectType.MINOR_PLANET:
          icon = "minor-planet";
          break;
        case SolarSystemSubjectType.COMET:
          icon = "comet";
          break;
        case SolarSystemSubjectType.OCCULTATION:
          icon = "occultation";
          break;
        case SolarSystemSubjectType.CONJUNCTION:
          icon = "conjunction";
          break;
        case SolarSystemSubjectType.PARTIAL_LUNAR_ECLIPSE:
        case SolarSystemSubjectType.PARTIAL_SOLAR_ECLIPSE:
        case SolarSystemSubjectType.TOTAL_LUNAR_ECLIPSE:
        case SolarSystemSubjectType.TOTAL_SOLAR_ECLIPSE:
          icon = "eclipse";
          break;
        case SolarSystemSubjectType.ANULAR_SOLAR_ECLIPSE:
          icon = "annular-eclipse";
          break;
        case SolarSystemSubjectType.METEOR_SHOWER:
          icon = "meteor-shower";
          break;
        case SolarSystemSubjectType.OTHER:
          icon = "other";
          break;
      }
    } else {
      switch (value) {
        case SubjectType.DEEP_SKY:
          icon = "galaxy";
          break;
        case SubjectType.SOLAR_SYSTEM:
          icon = "other";
          break;
        case SubjectType.WIDE_FIELD:
          icon = "constellation";
          break;
        case SubjectType.STAR_TRAILS:
          icon = "star-trails";
          break;
        case SubjectType.NORTHERN_LIGHTS:
          icon = "northern-lights";
          break;
        case SubjectType.NOCTILUCENT_CLOUDS:
          icon = "cloud";
          break;
        case SubjectType.LANDSCAPE:
          icon = "landscape";
          break;
        case SubjectType.ARTIFICIAL_SATELLITE:
          icon = "artificial-satellite";
          break;
        case SubjectType.GEAR:
          icon = "gear";
          break;
        case SubjectType.OTHER:
          icon = "other";
          break;
      }
    }

    return `subject-types/${icon}-${color}.png?v=1`;
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

  getDataSourceIcon(value: DataSource, color: "white" | "black"): string {
    let icon: string = null;

    switch (value) {
      case DataSource.BACKYARD:
        icon = "backyard";
        break;
      case DataSource.TRAVELLER:
        icon = "traveller";
        break;
      case DataSource.OWN_REMOTE:
        icon = "own-remote";
        break;
      case DataSource.AMATEUR_HOSTING:
        icon = "amateur-hosting";
        break;
      case DataSource.PUBLIC_AMATEUR_DATA:
        icon = "public-amateur-data";
        break;
      case DataSource.PRO_DATA:
        icon = "pro-data";
        break;
      case DataSource.MIX:
        icon = "mix";
        break;
    }

    if (icon) {
      return `data-sources/${icon}-${color}.png?v=1`;
    }

    return null;
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
        return this.translateService.instant("All rights reserved");
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

  isImage(object: ImageInterface | ImageRevisionInterface): object is ImageInterface {
    return (object as ImageInterface).revisions !== undefined;
  }

  getCelestialHemisphere(image: ImageInterface, revisionLabel: string): CelestialHemisphere {
    const revision = this.getRevision(image, revisionLabel);

    if (!revision.solution || !revision.solution.dec) {
      return null;
    }

    if (parseFloat(revision.solution.dec) >= 0) {
      return CelestialHemisphere.NORTHERN;
    }

    return CelestialHemisphere.SOUTHERN;
  }

  getConstellation(image: ImageInterface, revisionLabel: string): string {
    const revision = this.getRevision(image, revisionLabel);
    return revision.constellation;
  }

  getAverageBortleScale(image: ImageInterface): number {
    const acquisitionsWithBortleScale = image.deepSkyAcquisitions?.filter(
      acquisition => !!acquisition.bortle
    );

    if (acquisitionsWithBortleScale.length > 0) {
      const totalWeightedBortle = acquisitionsWithBortleScale.reduce((acc, acquisition) => {
        return acc + (acquisition.bortle * parseFloat(acquisition.duration));
      }, 0);

      const totalDuration = acquisitionsWithBortleScale.reduce((acc, acquisition) => {
        return acc + parseFloat(acquisition.duration);
      }, 0);

      const bortle = totalDuration > 0 ? totalWeightedBortle / totalDuration : null;

      if (bortle !== null) {
        return parseFloat(bortle.toFixed(2));
      }
    }

    return null;
  }

  formatIntegration(integration: number): string {
    const seconds = integration % 60;
    const minutes = Math.floor(integration / 60) % 60;
    const hours = Math.floor(integration / 3600);

    const hourSymbol = "<span class='symbol'>h</span>";
    const minuteSymbol = "<span class='symbol'>&prime;</span>";
    const secondSymbol = "<span class='symbol'>&Prime;</span>";

    if (hours > 0) {
      if (minutes > 0 || seconds > 0) {
        const minutePart = minutes > 0 ? `${minutes}${minuteSymbol} ` : "";
        const secondPart = seconds > 0 ? `${seconds.toFixed(2).replace(".00", "")}${secondSymbol}` : "";
        return `${hours}${hourSymbol} ${minutePart}${secondPart}`.trim();
      }
      return `${hours}${hourSymbol}`;
    }

    if (minutes > 0) {
      if (seconds > 0) {
        return `${minutes}${minuteSymbol} ${seconds}${secondSymbol}`;
      }
      return `${minutes}${minuteSymbol}`;
    }

    return `${seconds}${secondSymbol}`;
  };

  getDeepSkyIntegration(image: ImageInterface): string {
    const getIntegration = (acquisition: DeepSkyAcquisitionInterface): number => {
      if (acquisition.number === null || acquisition.duration === null) {
        return 0;
      }
      return acquisition.number * parseFloat(acquisition.duration);
    };

    if (image.deepSkyAcquisitions?.length > 0) {
      const integration = image.deepSkyAcquisitions.map(getIntegration).reduce((acc, val) => acc + val, 0);
      return this.formatIntegration(integration);
    }

    return null;
  }

  getSolarSystemIntegration(image: ImageInterface): string {
    if (image.solarSystemAcquisitions?.length > 0) {
      const acquisition = image.solarSystemAcquisitions[0];
      if (acquisition.frames && acquisition.exposurePerFrame) {
        return `${acquisition.frames} &times; ${acquisition.exposurePerFrame}s`;
      }
    }

    return null;
  }

  getPublicationDate(image: ImageInterface): string {
    const final = this.getFinalRevision(image);

    if (this.isImage(final)) {
      return final.published || final.uploaded;
    }

    return final.uploaded;
  }

  getCoordinates(
    image: ImageInterface,
    revisionLabel: string,
    html = true,
    symbols = true,
    pad = false,
    precision = 0
  ): string {
    const revision = this.getRevision(image, revisionLabel);

    if (!revision.solution || !revision.solution.ra || !revision.solution.dec) {
      return null;
    }

    const ra = this.formatRightAscension(
      parseFloat(revision.solution.advancedRa || revision.solution.ra),
      html,
      symbols,
      pad,
      precision
    );
    const dec = this.formatDeclination(
      parseFloat(revision.solution.advancedDec || revision.solution.dec),
      html,
      symbols,
      pad,
      precision
    );

    if (html) {
      return `<span class="ra">${ra}</span><span class="separator">&middot;</span><span class="dec">${dec}</span>`;
    }

    return `${ra}, ${dec}`;
  }

  getCoordinatesInDecimalFormat(image: ImageInterface, revisionLabel: string): string {
    const revision = this.getRevision(image, revisionLabel);

    if (!revision.solution || !revision.solution.ra || !revision.solution.dec) {
      return null;
    }

    const ra = parseFloat(revision.solution.advancedRa || revision.solution.ra);
    const dec = parseFloat(revision.solution.advancedDec || revision.solution.dec);

    return `${ra.toFixed(6)}, ${dec.toFixed(6)}`;
  }

  formatRightAscension(
    ra: number,
    html = true,
    symbols = true,
    pad = false,
    precision = 0
  ): string {
    const hours = Math.floor(ra / 15);
    const minutes = Math.floor((ra % 15) * 4);
    const seconds = Number((((ra % 15) * 4 - minutes) * 60).toFixed(precision));

    const paddedHours = pad ? UtilsService.padNumber(hours) : hours;
    const paddedMinutes = pad ? UtilsService.padNumber(minutes) : minutes;
    const paddedSeconds = pad ? UtilsService.padNumber(seconds) : seconds;

    if (html && symbols) {
      return `
      <span class="hours">${paddedHours}<span class="symbol">h</span></span>
      <span class="minutes">${paddedMinutes}<span class="symbol">m</span></span>
      <span class="seconds">${paddedSeconds}<span class="symbol">s</span></span>
    `;
    }

    if (html) {
      return `
      <span class="hours">${paddedHours}</span>
      <span class="minutes">${paddedMinutes}</span>
      <span class="seconds">${paddedSeconds}</span>`;
    }

    if (symbols) {
      return `${paddedHours}h ${paddedMinutes}m ${paddedSeconds}s`;
    }

    return `${paddedHours} ${paddedMinutes} ${paddedSeconds}`;
  }

  formatDeclination(
    dec: number,
    html = true,
    symbols = true,
    pad = false,
    precision = 0
  ): string {
    const degrees = Math.floor(dec);
    const minutes = Math.floor((dec - degrees) * 60);
    const seconds = Number((((dec - degrees) * 60 - minutes) * 60).toFixed(precision));

    const paddedDegrees = pad ? UtilsService.padNumber(degrees) : degrees;
    const paddedMinutes = pad ? UtilsService.padNumber(minutes) : minutes;
    const paddedSeconds = pad ? UtilsService.padNumber(seconds) : seconds;

    const formattedDegrees = degrees >= 0 ? `+${paddedDegrees}` : paddedDegrees;

    if (html && symbols) {
      return `
      <span class="degrees">${formattedDegrees}<span class="symbol">&deg;</span></span>
      <span class="minutes">${paddedMinutes}<span class="symbol">&prime;</span></span>
      <span class="seconds">${paddedSeconds}<span class="symbol">&Prime;</span></span>
    `;
    }

    if (html) {
      return `
      <span class="degrees">${formattedDegrees}</span>
      <span class="minutes">${paddedMinutes}</span>
      <span class="seconds">${paddedSeconds}</span>`;
    }

    if (symbols) {
      return `${formattedDegrees}° ${paddedMinutes}' ${paddedSeconds}"`;
    }

    return `${formattedDegrees} ${paddedMinutes} ${paddedSeconds}`;
  }

  getPixelScale(image: ImageInterface, revisionLabel: string): string {
    const revision = this.getRevision(image, revisionLabel);

    if (!revision.solution || !revision.solution.pixscale) {
      return null;
    }

    const symbol = "<span class='symbol'>&Prime;/px</span>";
    const value = parseFloat((revision.solution.advancedPixscale || revision.solution.pixscale)).toFixed(2);

    return `${value}${symbol}`;
  }

  getOrientation(image: ImageInterface, revisionLabel: string): string {
    const revision = this.getRevision(image, revisionLabel);

    if (!revision.solution || !revision.solution.orientation) {
      return null;
    }

    const symbol = "<span class='symbol'>&deg;N</span>";
    const value = parseFloat((revision.solution.advancedOrientation || revision.solution.orientation)).toFixed(2);

    return `${value}${symbol}`;
  }

  getFieldRadius(image: ImageInterface, revisionLabel: string): string {
    const revision = this.getRevision(image, revisionLabel);

    if (!revision.solution || !revision.solution.radius) {
      return null;
    }

    const symbol = "<span class='symbol'>&deg;</span>";
    const value = parseFloat(revision.solution.radius).toFixed(2);

    return `${value}${symbol}`;
  }

  validateRevisionLabel(image: ImageInterface, revisionLabel: string): string {
    if (
      revisionLabel !== null &&
      revisionLabel !== ORIGINAL_REVISION_LABEL &&
      revisionLabel !== FINAL_REVISION_LABEL &&
      !image.revisions.find(revision => revision.label === revisionLabel)
    ) {
      return FINAL_REVISION_LABEL;
    }

    return revisionLabel;
  }

  getRevision(image: ImageInterface, revisionLabel: string): ImageInterface | ImageRevisionInterface {
    revisionLabel = this.validateRevisionLabel(image, revisionLabel);

    if (revisionLabel === null || revisionLabel === ORIGINAL_REVISION_LABEL) {
      return image;
    }

    if (revisionLabel === FINAL_REVISION_LABEL) {
      return this.getFinalRevision(image);
    }

    const revisionByLabel = image.revisions?.find(revision => revision.label === revisionLabel);

    return revisionByLabel || this.getFinalRevision(image);
  }

  getFinalRevision(image: ImageInterface): ImageInterface | ImageRevisionInterface {
    if (image.isFinal) {
      return image;
    }

    if (image.revisions && image.revisions.length > 0) {
      const finalRevision = image.revisions.find(revision => revision.isFinal);
      if (finalRevision) {
        return finalRevision;
      }
    }

    return image;
  }

  getFinalRevisionLabel(image: ImageInterface): string {
    if (image.isFinal) {
      return ORIGINAL_REVISION_LABEL;
    }

    if (image.revisions && image.revisions.length > 0) {
      const finalRevision = image.revisions.find(revision => revision.isFinal);
      if (finalRevision) {
        return finalRevision.label;
      }
    }

    return null;
  }

  hasEquipment(image: ImageInterface): boolean {
    return (
      image.imagingTelescopes2?.length > 0 ||
      image.imagingCameras2?.length > 0 ||
      image.mounts2?.length > 0 ||
      image.filters2?.length > 0 ||
      image.accessories2?.length > 0 ||
      image.software2?.length > 0 ||
      image.guidingTelescopes2?.length > 0 ||
      image.guidingCameras2?.length > 0 ||
      image.imagingTelescopes?.length > 0 ||
      image.imagingCameras?.length > 0 ||
      image.mounts?.length > 0 ||
      image.filters?.length > 0 ||
      image.accessories?.length > 0 ||
      image.focalReducers?.length > 0 ||
      image.software?.length > 0
    );
  }

  hasImagingEquipment(image: ImageInterface): boolean {
    return (
      image.imagingTelescopes2?.length > 0 ||
      image.imagingCameras2?.length > 0 ||
      image.imagingTelescopes?.length > 0 ||
      image.imagingCameras?.length > 0 ||
      image.mounts2?.length > 0 ||
      image.mounts?.length > 0 ||
      image.filters2?.length > 0 ||
      image.filters?.length > 0 ||
      image.accessories2?.length > 0 ||
      image.accessories?.length > 0 ||
      image.focalReducers?.length > 0
    );
  }

  hasGuidingEquipment(image: ImageInterface): boolean {
    return (
      image.guidingTelescopes2?.length > 0 ||
      image.guidingCameras2?.length > 0 ||
      image.guidingTelescopes?.length > 0 ||
      image.guidingCameras?.length > 0
    );
  }

  isPlateSolvable(image: ImageInterface): boolean {
    const isDeepSkyPlateSolvable = [
      SubjectType.DEEP_SKY, SubjectType.WIDE_FIELD
    ].indexOf(image.subjectType) !== -1;

    const isSolarSystemPlateSolvable =
      image.subjectType === SubjectType.SOLAR_SYSTEM &&
      image.solarSystemMainSubject !== SolarSystemSubjectType.COMET;

    return isDeepSkyPlateSolvable || isSolarSystemPlateSolvable;
  }

  loadImage(imageId: ImageInterface["hash"] | ImageInterface["pk"]): Observable<ImageInterface> {
    return new Observable<ImageInterface>(observer => {
      this.store$.pipe(
        select(selectImage, imageId),
        filter(image => !!image),
        take(1)
      ).subscribe({
        next: image => {
          observer.next(image);
          observer.complete();
        },
        error: err => {
          observer.error(err);
          observer.complete();
        }
      });

      this.actions$.pipe(
        ofType(AppActionTypes.LOAD_IMAGE_FAILURE),
        filter((action: LoadImageFailure) => action.payload.imageId === imageId),
        take(1)
      ).subscribe({
        next: err => {
          observer.error(err);
          observer.complete();
        }
      });

      this.store$.dispatch(new LoadImage({ imageId }));
    });
  }

  loadImageFile(url: string, progressCallback: (progress: number) => void): Observable<string> {
    if (isPlatformServer(this.platformId)) {
      // For SSR, just return the URL as-is
      return of(url);
    }

    return new Observable<string>(observer => {
      if (typeof XMLHttpRequest === "undefined") {
        // Fallback for environments without XMLHttpRequest
        this.http.get(url, { responseType: "blob" }).pipe(
          tap(() => progressCallback(100)),
          map(blob => this._createObjectURL(blob))
        ).subscribe(
          objectUrl => {
            observer.next(objectUrl);
            observer.complete();
          },
          error => observer.error(error)
        );
        return;
      }

      const xhr = new XMLHttpRequest();
      let notifiedNotComputable = false;

      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";

      xhr.onprogress = event => {
        this.zone.run(() => {
          if (event.lengthComputable) {
            const progress: number = (event.loaded / event.total) * 100;
            progressCallback(progress);
          } else if (!notifiedNotComputable) {
            notifiedNotComputable = true;
            progressCallback(-1);
          }
        });
      };

      xhr.onloadend = () => {
        this.zone.run(() => {
          if (!xhr.status.toString().match(/^2/)) {
            // Try a more traditional approach
            this._loadImageFileTraditional(url, observer);
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
          observer.next(this._createObjectURL(blob));
          observer.complete();
        });
      };

      xhr.onerror = () => {
        this.zone.run(() => {
          // Fallback to traditional approach on error
          this._loadImageFileTraditional(url, observer);
        });
      };

      xhr.send();
    });
  }

  showInvalidImageNotification(): void {
    this._imageNotFoundNotification = this.popNotificationsService.error(this.translateService.instant(
      "Image not found. It may have been deleted or you have an invalid link."
    ));
  }

  removeInvalidImageNotification(): void {
    if (this._imageNotFoundNotification) {
      this.popNotificationsService.remove(this._imageNotFoundNotification.toastId);
      this._imageNotFoundNotification = null;
    }
  }

  getShareUrl(image: ImageInterface, revisionLabel: string): string {
    let url = `${this.windowRef.nativeWindow.location.origin}/i/${image.hash || image.pk}`;

    if (revisionLabel === null || revisionLabel === FINAL_REVISION_LABEL) {
      return url;
    }

    if (revisionLabel === ORIGINAL_REVISION_LABEL) {
      return `${url}?r=0`;
    }

    return `${url}?r=${revisionLabel}`;
  }

  private _loadImageFileTraditional(url: string, observer: Observer<string>): void {
    const image = new Image();
    image.onload = () => {
      observer.next(url);
      observer.complete();
    };
    image.onerror = error => observer.error(error);
    image.src = url;
  }

  private _createObjectURL(blob: Blob): string {
    if (typeof URL !== "undefined" && URL.createObjectURL) {
      return URL.createObjectURL(blob);
    }
    // Fallback for environments without URL.createObjectURL
    return "";
  }
}
