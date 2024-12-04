import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";

@Component({
  selector: 'astrobin-image-hover',
  template: `
    <div class="hover d-flex align-items-end gap-2">
      <div class="flex-grow-1">
        <div class="title">{{ image.title }}</div>
        <div *ngIf="image.published" class="published">{{ image.published | localDate | timeago }}</div>
        <div *ngIf="!image.published && image.uploaded"
             class="uploaded">{{ image.uploaded | localDate | timeago }}
        </div>
      </div>

      <div class="counters d-flex flex-column gap-1">
        <div class="counter likes">
          <fa-icon icon="thumbs-up"></fa-icon>
          <span class="value">{{ image.likeCount }}</span>
        </div>
        <div class="counter bookmarks">
          <fa-icon icon="bookmark"></fa-icon>
          <span class="value">{{ image.bookmarkCount }}</span>
        </div>
        <div class="counter comments">
          <fa-icon icon="comment"></fa-icon>
          <span class="value">{{ image.commentCount }}</span>
        </div>
      </div>
    </div>`,
  styleUrls: ['./image-hover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageHoverComponent {
  @Input() image: ImageInterface;
}
