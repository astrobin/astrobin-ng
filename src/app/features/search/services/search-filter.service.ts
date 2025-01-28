import { Injectable } from "@angular/core";
import { BaseService } from "@core/services/base.service";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { forkJoin, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { LoadingService } from "@core/services/loading.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { SearchFilterComponentInterface } from "@core/interfaces/search-filter-component.interface";
import { MatchType } from "@features/search/enums/match-type.enum";
import { TranslateService } from "@ngx-translate/core";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { SimplifiedSubscriptionName } from "@core/types/subscription-name.type";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchPersonalFiltersFilterValue } from "@features/search/components/filters/search-personal-filters-filter/search-personal-filters-filter.value";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Injectable({
  providedIn: "root"
})
export class SearchFilterService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly translateService: TranslateService,
    public readonly modalService: NgbModal
  ) {
    super(loadingService);
  }

  allowFilter$(minimumSubscription: PayableProductInterface): Observable<boolean> {
    return forkJoin([
      this.userSubscriptionService.isLite$(),
      this.userSubscriptionService.isClassicLite$(),
      this.userSubscriptionService.isPremium$(),
      this.userSubscriptionService.isClassicPremium$(),
      this.userSubscriptionService.isUltimate$()
    ]).pipe(
      map(([
        isLite,
        isClassicLite,
        isPremium,
        isClassicPremium,
        isUltimate
      ]) => ({
        isLite,
        isClassicLite,
        isPremium,
        isClassicPremium,
        isUltimate
      })),
      map(({
        isLite,
        isClassicLite,
        isPremium,
        isClassicPremium,
        isUltimate
      }) => {
        return (
          (minimumSubscription === null || minimumSubscription === undefined) ||
          (minimumSubscription === PayableProductInterface.LITE && (isLite || isPremium || isUltimate)) ||
          (minimumSubscription === PayableProductInterface.PREMIUM && (isPremium || isUltimate)) ||
          (minimumSubscription === PayableProductInterface.ULTIMATE && (
              isClassicLite || isClassicPremium || isUltimate) // Grandfathered users + Ultimate.
          )
        );
      })
    );
  }

  getKeyByFilterComponentInstance(componentInstance: SearchFilterComponentInterface): string {
    return (componentInstance.constructor as any).key;
  }

  humanizeSearchAutoCompleteType(type: SearchAutoCompleteType): string {
    switch (type) {
      case SearchAutoCompleteType.TEXT:
        return this.translateService.instant("Free text");
      case SearchAutoCompleteType.SEARCH_FILTER:
        return this.translateService.instant("Search filters");
      case SearchAutoCompleteType.SUBJECTS:
        return this.translateService.instant("Subjects");
      case SearchAutoCompleteType.SUBJECT_TYPE:
        return this.translateService.instant("Subject type");
      case SearchAutoCompleteType.TELESCOPE:
        return this.translateService.instant("Telescopes or lenses");
      case SearchAutoCompleteType.SENSOR:
        return this.translateService.instant("Sensors");
      case SearchAutoCompleteType.CAMERA:
        return this.translateService.instant("Cameras");
      case SearchAutoCompleteType.MOUNT:
        return this.translateService.instant("Mounts");
      case SearchAutoCompleteType.FILTER:
        return this.translateService.instant("Filters");
      case SearchAutoCompleteType.ACCESSORY:
        return this.translateService.instant("Accessories");
      case SearchAutoCompleteType.SOFTWARE:
        return this.translateService.instant("Software");
      case SearchAutoCompleteType.TELESCOPE_TYPES:
        return this.translateService.instant("Telescope types");
      case SearchAutoCompleteType.CAMERA_TYPES:
        return this.translateService.instant("Camera types");
      case SearchAutoCompleteType.ACQUISITION_MONTHS:
        return this.translateService.instant("Acquisition months");
      case SearchAutoCompleteType.REMOTE_SOURCE:
        return this.translateService.instant("Remote hosting");
      case SearchAutoCompleteType.COLOR_OR_MONO:
        return this.translateService.instant("Color or mono cameras");
      case SearchAutoCompleteType.MODIFIED_CAMERA:
        return this.translateService.instant("Modified cameras only");
      case SearchAutoCompleteType.ANIMATED:
        return this.translateService.instant("Animated images (GIF) only");
      case SearchAutoCompleteType.VIDEO:
        return this.translateService.instant("Videos only");
      case SearchAutoCompleteType.AWARD:
        return this.translateService.instant("IOTD/TP award");
      case SearchAutoCompleteType.COUNTRY:
        return this.translateService.instant("User country");
      case SearchAutoCompleteType.DATA_SOURCE:
        return this.translateService.instant("Data source");
      case SearchAutoCompleteType.MINIMUM_DATA:
        return this.translateService.instant("Minimum data");
      case SearchAutoCompleteType.CONSTELLATION:
        return this.translateService.instant("Constellation");
      case SearchAutoCompleteType.BORTLE_SCALE:
        return this.translateService.instant("Bortle scale");
      case SearchAutoCompleteType.LICENSES:
        return this.translateService.instant("Licenses");
      case SearchAutoCompleteType.CAMERA_PIXEL_SIZE:
        return this.translateService.instant("Camera pixel size");
      case SearchAutoCompleteType.FIELD_RADIUS:
        return this.translateService.instant("Field radius");
      case SearchAutoCompleteType.PIXEL_SCALE:
        return this.translateService.instant("Pixel scale");
      case SearchAutoCompleteType.TELESCOPE_DIAMETER:
        return this.translateService.instant("Telescope diameter");
      case SearchAutoCompleteType.TELESCOPE_WEIGHT:
        return this.translateService.instant("Telescope weight");
      case SearchAutoCompleteType.MOUNT_WEIGHT:
        return this.translateService.instant("Mount weight");
      case SearchAutoCompleteType.MOUNT_MAX_PAYLOAD:
        return this.translateService.instant("Mount max. payload");
      case SearchAutoCompleteType.TELESCOPE_FOCAL_LENGTH:
        return this.translateService.instant("Telescope focal length");
      case SearchAutoCompleteType.INTEGRATION_TIME:
        return this.translateService.instant("Integration time");
      case SearchAutoCompleteType.FILTER_TYPES:
        return this.translateService.instant("Filter types");
      case SearchAutoCompleteType.SIZE:
        return this.translateService.instant("File size");
      case SearchAutoCompleteType.DATE_PUBLISHED:
        return this.translateService.instant("Date published");
      case SearchAutoCompleteType.DATE_ACQUIRED:
        return this.translateService.instant("Date acquired");
      case SearchAutoCompleteType.ACQUISITION_TYPE:
        return this.translateService.instant("Acquisition type");
      case SearchAutoCompleteType.MOON_PHASE:
        return this.translateService.instant("Moon illumination");
      case SearchAutoCompleteType.COORDS:
        return this.translateService.instant("RA/Dec coordinates");
      case SearchAutoCompleteType.IMAGE_SIZE:
        return this.translateService.instant("Width and height");
      case SearchAutoCompleteType.GROUPS:
        return this.translateService.instant("Featured in groups");
      case SearchAutoCompleteType.PERSONAL_FILTERS:
        return this.translateService.instant("Personal filters");
      case SearchAutoCompleteType.USERS:
        return this.translateService.instant("Users");
    }
  }

  humanizeMatchType(type: MatchType): string {
    switch (type) {
      case MatchType.ALL:
        return this.translateService.instant("All words");
      case MatchType.ANY:
        return this.translateService.instant("Any word");
    }
  }

  humanizePersonalFilter(value: SearchPersonalFiltersFilterValue): string {
    switch (value) {
      case SearchPersonalFiltersFilterValue.MY_IMAGES:
        return this.translateService.instant("My images");
      case SearchPersonalFiltersFilterValue.MY_LIKES:
        return this.translateService.instant("My likes");
      case SearchPersonalFiltersFilterValue.MY_BOOKMARKS:
        return this.translateService.instant("My bookmarks");
      case SearchPersonalFiltersFilterValue.MY_FOLLOWED_USERS:
        return this.translateService.instant("My followed users");
    }
  }

  openSubscriptionRequiredModal(minimumSubscription: PayableProductInterface): void {
    const modalRef = this.modalService.open(SubscriptionRequiredModalComponent);
    let value: SimplifiedSubscriptionName;

    switch (minimumSubscription) {
      case PayableProductInterface.LITE:
        value = SimplifiedSubscriptionName.ASTROBIN_LITE;
        break;
      case PayableProductInterface.PREMIUM:
        value = SimplifiedSubscriptionName.ASTROBIN_PREMIUM;
        break;
      case PayableProductInterface.ULTIMATE:
        value = SimplifiedSubscriptionName.ASTROBIN_ULTIMATE_2020;
        break;
    }

    modalRef.componentInstance.minimumSubscription = value;
  }
}
