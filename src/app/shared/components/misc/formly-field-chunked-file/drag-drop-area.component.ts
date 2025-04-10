import type { ElementRef, NgZone, OnInit, Renderer2 } from "@angular/core";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";

@Component({
  selector: "astrobin-drag-drop-area",
  templateUrl: "./drag-drop-area.component.html",
  styleUrls: ["./drag-drop-area.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DragDropAreaComponent implements OnInit {
  @ViewChild("dropArea", { static: true }) dropArea: ElementRef;
  @Input() multipleFiles = false;
  @Output() filesDrop = new EventEmitter<FileList | File[]>();

  isDragActive = false;

  constructor(private ngZone: NgZone, private renderer: Renderer2) {}

  ngOnInit() {
    // Attach listeners inside Angular's zone to ensure change detection works properly
    this.ngZone.run(() => {
      this.renderer.listen(this.dropArea.nativeElement, "dragover", this.onDragOver.bind(this));
      this.renderer.listen(this.dropArea.nativeElement, "dragleave", this.onDragLeave.bind(this));
      this.renderer.listen(this.dropArea.nativeElement, "drop", this.onDrop.bind(this));
    });
  }

  /**
   * Handles the dragover event for drag and drop file uploads
   */
  onDragOver(event: DragEvent): void {
    // Run inside the zone to ensure change detection is triggered
    this.ngZone.run(() => {
      // Prevent default to allow drop
      event.preventDefault();

      // Set visual indicator
      if (event.dataTransfer?.items[0]?.kind === "file") {
        if (!this.multipleFiles && event.dataTransfer.items.length > 1) {
          // Disallow drop if multiple files when multiple isn't enabled
          event.dataTransfer.dropEffect = "none";
        } else {
          // Allow drop
          event.dataTransfer.dropEffect = "copy";
          this.isDragActive = true;
        }
      }
    });
  }

  /**
   * Handles the dragleave event for drag and drop file uploads
   */
  onDragLeave(event: DragEvent): void {
    this.ngZone.run(() => {
      event.preventDefault();
      this.isDragActive = false;
    });
  }

  /**
   * Handles the drop event for drag and drop file uploads
   */
  onDrop(event: DragEvent): void {
    this.ngZone.run(() => {
      event.preventDefault();
      this.isDragActive = false;

      // Get dropped files
      const files = this.getFilesFromDragEvent(event);

      if (files.length) {
        // Emit the files
        this.filesDrop.emit(files);
      }
    });
  }

  /**
   * Extract files from a drag event
   */
  private getFilesFromDragEvent(event: DragEvent): FileList | File[] {
    const dataTransfer = new DataTransfer();
    const items = event.dataTransfer?.items;

    if (items?.length) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          // Skip directories
          const entry = item.webkitGetAsEntry?.();
          if (!entry || !entry.isDirectory) {
            const file = item.getAsFile();
            if (file) {
              dataTransfer.items.add(file);
            }
          }
        }
      }
    }

    return dataTransfer.files;
  }
}
