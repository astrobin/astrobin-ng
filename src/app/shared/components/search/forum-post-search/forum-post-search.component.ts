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
import type { ForumPostSearchInterface } from "@core/interfaces/forum-post-search.interface";
import { ForumPostSearchApiService } from "@core/services/api/forum/forum-post-search-api.service";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ScrollableSearchResultsBaseComponent } from "@shared/components/search/scrollable-search-results-base/scrollable-search-results-base.component";
import type { Observable } from "rxjs";

@Component({
  selector: "astrobin-forum-post-search",
  templateUrl: "./forum-post-search.component.html",
  styleUrls: ["./forum-post-search.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$, windowRefService, elementRef, platformId, translateService, utilsService, changeDetectorRef);
  }

  fetchData(): Observable<PaginatedApiResultInterface<ForumPostSearchInterface>> {
    return this.forumPostSearchApiService.search({ ...this.model, pageSize: this.pageSize });
  }

  openPost(post: ForumPostSearchInterface) {
    this.windowRefService.nativeWindow.open(
      this.classicRoutesService.FORUM_POST(post.id.replace("pybb.post.", "")),
      "_self"
    );
  }
}
