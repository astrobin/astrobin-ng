import { Component, ElementRef, Inject, Input, PLATFORM_ID } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { Observable } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TranslateService } from "@ngx-translate/core";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { ScrollableSearchResultsBaseComponent } from "@shared/components/search/scrollable-search-results-base/scrollable-search-results-base.component";
import { UserSearchInterface } from "@shared/interfaces/user-search.interface";
import { UserSearchApiService } from "@shared/services/api/classic/users/user-search-api.service";

@Component({
  selector: "astrobin-user-search",
  templateUrl: "./user-search.component.html",
  styleUrls: ["./user-search.component.scss"]
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
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>
  ) {
    super(store$, windowRefService, elementRef, platformId, translateService);
  }

  fetchData(): Observable<PaginatedApiResultInterface<UserSearchInterface>> {
    return this.userSearchApiService.search({ ...this.model, pageSize: this.pageSize });
  }

  avatarUrl(user: UserSearchInterface): string {
    if (!user.avatarUrl || user.avatarUrl === "" || user.avatarUrl.indexOf("default-avatar") > -1) {
      return "/assets/images/default-avatar.jpeg?v=2";
    }

    return user.avatarUrl;
  }

  openUser(user: UserSearchInterface) {
    this.windowRefService.nativeWindow.open(
      this.classicRoutesService.GALLERY(user.username),
      "_self"
    );
  }
}
