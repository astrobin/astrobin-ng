import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  PLATFORM_ID
} from "@angular/core";
import type { MainState } from "@app/store/state";
import type { UserSearchInterface } from "@core/interfaces/user-search.interface";
import { UserSearchApiService } from "@core/services/api/classic/users/user-search-api.service";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { UserService } from "@core/services/user.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ScrollableSearchResultsBaseComponent } from "@shared/components/search/scrollable-search-results-base/scrollable-search-results-base.component";
import type { Observable } from "rxjs";
import { take } from "rxjs/operators";

@Component({
  selector: "astrobin-user-search",
  templateUrl: "./user-search.component.html",
  styleUrls: ["./user-search.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSearchComponent extends ScrollableSearchResultsBaseComponent<UserSearchInterface> {
  @Input()
  model: SearchModelInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly userSearchApiService: UserSearchApiService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    public readonly translateService: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>,
    public readonly utilsService: UtilsService,
    public readonly userService: UserService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$, windowRefService, elementRef, platformId, translateService, utilsService, changeDetectorRef);
  }

  fetchData(): Observable<PaginatedApiResultInterface<UserSearchInterface>> {
    return this.userSearchApiService.search({ ...this.model, pageSize: this.pageSize });
  }

  avatarUrl(user: UserSearchInterface): string {
    return UtilsService.convertDefaultAvatar(user.avatarUrl);
  }

  openUser(user: UserSearchInterface) {
    this.currentUserProfile$.pipe(take(1)).subscribe(currentUserProfile => {
      this.userService.openGallery(user.username, !currentUserProfile || currentUserProfile.enableNewGalleryExperience);
    });
  }
}
