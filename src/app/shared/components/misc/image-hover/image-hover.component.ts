import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ImageSearchInterface } from "@shared/interfaces/image-search.interface";

@Component({
  selector: 'astrobin-image-hover',
  template: `
    <div class="hover d-flex align-items-end gap-2">
      <div class="flex-grow-1">
        <div class="title">{{ image.title }}</div>
        <div *ngIf="showAuthor" class="author">{{ image.userDisplayName }}</div>
        <div *ngIf="published" class="published">{{ published | localDate | timeago }}</div>
        <div *ngIf="!published && uploaded"
             class="uploaded">{{ uploaded | localDate | timeago }}
        </div>
      </div>

      <div class="counters d-flex flex-column gap-1">
        <div class="counter likes">
          <fa-icon icon="thumbs-up"></fa-icon>
          <span class="value">{{ likes }}</span>
        </div>
        <div class="counter bookmarks">
          <fa-icon icon="bookmark"></fa-icon>
          <span class="value">{{ bookmarks }}</span>
        </div>
        <div class="counter comments">
          <fa-icon icon="comment"></fa-icon>
          <span class="value">{{ comments }}</span>
        </div>
      </div>
    </div>`,
  styleUrls: ['./image-hover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageHoverComponent implements OnChanges {
  @Input() image: ImageInterface | ImageSearchInterface;
  @Input() showAuthor = true;

  protected published: string;
  protected uploaded: string;
  protected likes: number;
  protected bookmarks: number;
  protected comments: number;

  ngOnChanges(): void {
    if (this.image.hasOwnProperty('likeCount')) {
      this.published = (this.image as ImageInterface).published;
      this.uploaded = (this.image as ImageInterface).uploaded;
      this.likes = (this.image as ImageInterface).likeCount;
      this.bookmarks = (this.image as ImageInterface).bookmarkCount;
      this.comments = (this.image as ImageInterface).commentCount;
    } else {
      this.published = (this.image as ImageSearchInterface).published;
      this.uploaded = null;
      this.likes = (this.image as ImageSearchInterface).likes;
      this.bookmarks = (this.image as ImageSearchInterface).bookmarks;
      this.comments = (this.image as ImageSearchInterface).comments;
    }
  }
}
