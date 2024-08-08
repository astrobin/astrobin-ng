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
import { NestedCommentSearchInterface } from "@shared/interfaces/nestedcomment-search.interface";
import { NestedCommentsSearchApiService } from "@shared/services/api/classic/nested-comments/nested-comments-search-api.service";

@Component({
  selector: "astrobin-nested-comment-search",
  templateUrl: "./nested-comment-search.component.html",
  styleUrls: ["./nested-comment-search.component.scss"]
})
export class NestedCommentSearchComponent extends ScrollableSearchResultsBaseComponent<NestedCommentSearchInterface> {
  @Input()
  model: SearchModelInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly nestedCommentsSearchApiService: NestedCommentsSearchApiService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    public readonly translateService: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>
  ) {
    super(store$, windowRefService, elementRef, platformId);
  }

  fetchData(url?: string): Observable<PaginatedApiResultInterface<NestedCommentSearchInterface>> {
    return this.nestedCommentsSearchApiService.search({ ...this.model, pageSize: this.pageSize });
  }

  openComment(comment: NestedCommentSearchInterface) {
    this.windowRefService.nativeWindow.open(
      `${comment.contentObjectUrl}#c${comment.id}`,
      "_self"
    );
  }
}
