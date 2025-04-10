import { ChangeDetectionStrategy, Component, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "astrobin-image-viewer-close-button",
  template: `
    <button class="btn btn-link text-light" (click)="closeClick.emit()">
      <fa-icon [ngbTooltip]="'Close' | translate" container="body" icon="times"></fa-icon>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerCloseButtonComponent {
  @Output() closeClick = new EventEmitter<void>();
}
