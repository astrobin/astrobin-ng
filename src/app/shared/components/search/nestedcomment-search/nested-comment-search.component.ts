import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Input, PLATFORM_ID } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { Observable } from "rxjs";
import { WindowRefService } from "@core/services/window-ref.service";
import { TranslateService } from "@ngx-translate/core";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { ScrollableSearchResultsBaseComponent } from "@shared/components/search/scrollable-search-results-base/scrollable-search-results-base.component";
import { NestedCommentSearchInterface } from "@core/interfaces/nestedcomment-search.interface";
import { NestedCommentsSearchApiService } from "@core/services/api/classic/nested-comments/nested-comments-search-api.service";
import { environment } from "@env/environment";
import { UtilsService } from "@core/services/utils/utils.service";

@Component({
  selector: "astrobin-nested-comment-search",
  templateUrl: "./nested-comment-search.component.html",
  styleUrls: ["./nested-comment-search.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$, windowRefService, elementRef, platformId, translateService, utilsService, changeDetectorRef);
  }

  fetchData(): Observable<PaginatedApiResultInterface<NestedCommentSearchInterface>> {
    return this.nestedCommentsSearchApiService.search({ ...this.model, pageSize: this.pageSize });
  }

  openComment(comment: NestedCommentSearchInterface) {
    const commentId = comment.id.replace("nested_comments.nestedcomment.", "");

    if (comment.className === "Image") {
      this.windowRefService.nativeWindow.open(
        environment.classicBaseUrl  + comment.contentObjectUrl + `#c${commentId}`,
        "_self"
      );
    } else {
      this.windowRefService.nativeWindow.open(
        `${comment.contentObjectUrl}#c${commentId}`,
        "_self"
      );
    }
  }
}
