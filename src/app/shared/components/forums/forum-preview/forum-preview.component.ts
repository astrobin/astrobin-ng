import { OnChanges, OnInit, SimpleChanges, Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { CategoryInterface } from "@core/interfaces/forums/category.interface";
import { ForumInterface } from "@core/interfaces/forums/forum.interface";
import { TopicInterface } from "@core/interfaces/forums/topic.interface";
import { ForumApiService } from "@core/services/api/forum/forum-api.service";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { map, switchMap, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-forum-preview",
  templateUrl: "./forum-preview.component.html",
  styleUrls: ["./forum-preview.component.scss"]
})
export class ForumPreviewComponent extends BaseComponentDirective implements OnInit, OnChanges {
  readonly MAX_TOPICS = 10;

  @Input()
  forumId: ForumInterface["id"];

  @Input()
  showHeader = true;

  @Input()
  showFooter = true;

  @Input()
  striped = true;

  @Input()
  useCard = true;

  category: CategoryInterface;
  forum: ForumInterface;
  topics: TopicInterface[] = null;
  loading: boolean;

  forumUrl: string;
  forumNewTopicUrl: string;

  equipmentCategoryDescription = this.translateService.instant(
    "Every equipment item on AstroBin has a forum associated with it. Anybody who used an " +
      "equipment item is notified of new topics in its forum, unless they opt out. This is very  " +
      "useful to connect with other users who use the same equipment as you. " +
      "{{ _0 }}Learn more about the AstroBin equipment database!{{ _1 }}",
    {
      _0: `<a href="https://welcome.astrobin.com/features/equipment-database" target="_blank">`,
      _1: "</a>"
    }
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly forumApiService: ForumApiService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._loadTopics();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.forumId) {
      this._loadTopics();
    }
  }

  topicUrl(topicId: TopicInterface["id"]): string {
    return `${this.classicRoutesService.FORUM_HOME}topic/${topicId}`;
  }

  protected topicTrackByFn(index: number, item: TopicInterface): number {
    return item.id;
  }

  private _loadTopics(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;

    if (this.forumId) {
      this.forumApiService
        .getForum(this.forumId)
        .pipe(
          tap(forum => {
            this.forum = forum;
            this.forumUrl = `${this.classicRoutesService.FORUM_HOME}c/equipment-forums/${forum.slug}/`;
            this.forumNewTopicUrl = `${this.classicRoutesService.FORUM_HOME}forum/${forum.id}/topic/add/`;
          }),
          switchMap(forum =>
            this.forumApiService.getCategory(forum.category).pipe(
              tap(category => (this.category = category)),
              map(() => forum)
            )
          ),
          switchMap(forum => this.forumApiService.loadTopics(forum.id))
        )
        .subscribe(response => {
          this.topics = response.results.slice(0, this.MAX_TOPICS);
          this.loading = false;
        });
    } else {
      this.forumUrl = `${this.classicRoutesService.FORUM_LATEST}`;
      this.forumNewTopicUrl = `${this.classicRoutesService.FORUM_HOME}/#new-topic`;
      this.forumApiService.latestTopics().subscribe(response => {
        this.topics = response.results.slice(0, this.MAX_TOPICS);
        this.loading = false;
      });
    }
  }
}
