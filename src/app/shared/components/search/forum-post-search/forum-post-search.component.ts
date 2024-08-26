import { Component, ElementRef, Inject, Input, PLATFORM_ID } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { Observable } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TranslateService } from "@ngx-translate/core";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { ForumPostSearchInterface } from "@shared/interfaces/forum-post-search.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { ScrollableSearchResultsBaseComponent } from "@shared/components/search/scrollable-search-results-base/scrollable-search-results-base.component";
import { ForumPostSearchApiService } from "@shared/services/api/forum/forum-post-search-api.service";

@Component({
  selector: "astrobin-forum-post-search",
  templateUrl: "./forum-post-search.component.html",
  styleUrls: ["./forum-post-search.component.scss"]
})
export class ForumPostSearchComponent extends ScrollableSearchResultsBaseComponent<ForumPostSearchInterface> {
  @Input()
  model: SearchModelInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly forumPostSearchApiService: ForumPostSearchApiService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    public readonly translateService: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>
  ) {
    super(store$, windowRefService, elementRef, platformId);
  }

  fetchData(): Observable<PaginatedApiResultInterface<ForumPostSearchInterface>> {
    return this.forumPostSearchApiService.search({ ...this.model, pageSize: this.pageSize });
  }

  openPost(post: ForumPostSearchInterface) {
    this.windowRefService.nativeWindow.open(
      this.classicRoutesService.FORUM_POST(
        post.id.replace("pybb.post.", "")),
      "_self"
    );
  }
}
