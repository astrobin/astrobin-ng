import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { ForumInterface } from "@shared/interfaces/forums/forum.interface";
import { TopicInterface } from "@shared/interfaces/forums/topic.interface";
import { ForumApiService } from "@shared/services/api/forum/forum-api.service";

@Component({
  selector: "astrobin-forum-preview",
  templateUrl: "./forum-preview.component.html",
  styleUrls: ["./forum-preview.component.scss"]
})
export class ForumPreviewComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input()
  forumId: ForumInterface["id"];

  topics: TopicInterface[] = null;
  loading: boolean;

  constructor(public readonly store$: Store<State>, public readonly forumApiService: ForumApiService) {
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

  private _loadTopics(): void {
    this.loading = true;
    this.forumApiService.loadTopics(this.forumId).subscribe(response => {
      this.topics = response.results.slice(0, 10);
      this.loading = false;
    });
  }
}
