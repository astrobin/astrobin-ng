import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { ForumInterface } from "@shared/interfaces/forums/forum.interface";
import { TopicInterface } from "@shared/interfaces/forums/topic.interface";
import { ForumApiService } from "@shared/services/api/forum/forum-api.service";
import { map, switchMap, tap } from "rxjs/operators";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { CategoryInterface } from "@shared/interfaces/forums/category.interface";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-forum-preview",
  templateUrl: "./forum-preview.component.html",
  styleUrls: ["./forum-preview.component.scss"]
})
export class ForumPreviewComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input()
  forumId: ForumInterface["id"];

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
      "{{ _0 }}Learn more about the AstroBin equipment database{{ _1 }}!",
    {
      _0: `<a href="https://welcome.astrobin.com/features/equipment-database" target="_blank">`,
      _1: "</a>"
    }
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly forumApiService: ForumApiService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.forumId) {
      this._loadTopics();
    }
  }

  topicUrl(topicId: TopicInterface["id"]): string {
    return `${this.classicRoutesService.FORUM_HOME}topic/${topicId}`;
  }

  getRepliesMessage(postCount: number): string {
    return this.translateService.instant("{{0}} replies", { 0: postCount - 1 });
  }

  private _loadTopics(): void {
    this.loading = true;
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
        this.topics = response.results.slice(0, 10);
        this.loading = false;
      });
  }
}
