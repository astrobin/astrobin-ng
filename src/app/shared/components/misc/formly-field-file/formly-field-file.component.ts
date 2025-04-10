import type { CdkDragDrop, CdkDragEnter, CdkDragMove } from "@angular/cdk/drag-drop";
import { moveItemInArray } from "@angular/cdk/drag-drop";
import type { ChangeDetectorRef, ElementRef, OnInit } from "@angular/core";
import { Component, ViewChild } from "@angular/core";
import type { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import type { LoadingService } from "@core/services/loading.service";
import type { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UtilsService } from "@core/services/utils/utils.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import { FieldType } from "@ngx-formly/core";
import type { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-formly-field-file",
  templateUrl: "./formly-field-file.component.html",
  styleUrls: ["./formly-field-file.component.scss"]
})
export class FormlyFieldFileComponent extends FieldType implements OnInit {
  @ViewChild("fileInput") el: ElementRef;
  @ViewChild("dropListContainer") dropListContainer?: ElementRef;

  selectedFiles: { file: File; url: SafeUrl }[] = [];

  // Drag and drop
  dropListReceiverElement?: HTMLElement;
  dragDropInfo?: {
    dragIndex: number;
    dropIndex: number;
  };

  constructor(
    public readonly sanitizer: DomSanitizer,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super();
  }

  ngOnInit() {
    if (this.formControl.value) {
      this.loadingService.setLoading(true);

      if (UtilsService.isArray(this.formControl.value)) {
        const promises = (this.formControl.value as string[]).map(async file => {
          const file1 = await UtilsService.fileFromUrl(file);
          this._setValueFromFiles([file1]);
        });

        Promise.all(promises).then(() => {
          this.loadingService.setLoading(false);
        });
      } else {
        UtilsService.fileFromUrl(this.formControl.value).then((file: File) => {
          this._setValueFromFiles([file]);
          this.loadingService.setLoading(false);
        });
      }
    }
  }

  openFileInput() {
    this.el.nativeElement.click();
  }

  onDelete(event: Event, index: number) {
    event.stopPropagation();

    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);

    this.formControl.setValue(this.selectedFiles);
    this.formControl.markAsTouched();
    this.formControl.markAsDirty();
  }

  onChange(event: any) {
    this._setValueFromFiles(event.target.files);
    this.formControl.markAsTouched();
    this.formControl.markAsDirty();
  }

  _setValueFromFiles(files: File[]) {
    files = [...files]; // Make sure this is a File[] and not a FileList.

    if (this.props.multiple) {
      if (this.props.maxFiles) {
        const currentCount = this.selectedFiles.length;
        const newCount = files.length;

        if (currentCount + newCount > this.props.maxFiles) {
          files = files.slice(0, this.props.maxFiles - currentCount);
          this.popNotificationsService.error(
            this.translateService.instant("You can only upload a maximum of {{maxFiles}} files.", {
              maxFiles: this.props.maxFiles
            })
          );
        }
      }
    } else {
      this.selectedFiles = [];
    }

    for (const file of files) {
      this.selectedFiles.push({
        file,
        url: this.sanitizer.bypassSecurityTrustUrl(
          (this.windowRefService.nativeWindow as any).URL.createObjectURL(file)
        )
      });
    }

    this.formControl.patchValue(this.selectedFiles);
    this.changeDetectorRef.detectChanges();
  }

  dragEntered(event: CdkDragEnter<number>) {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    this.dragDropInfo = { dragIndex, dropIndex };

    const placeholderContainer = dropList.element.nativeElement;
    const placeholderElement = placeholderContainer.querySelector(".cdk-drag-placeholder");

    if (placeholderElement) {
      placeholderContainer.removeChild(placeholderElement);
      placeholderContainer.parentElement?.insertBefore(placeholderElement, placeholderContainer);

      moveItemInArray(this.selectedFiles, dragIndex, dropIndex);
      this.formControl.setValue(this.selectedFiles);
    }
  }

  dragMoved(event: CdkDragMove<number>) {
    if (!this.dropListContainer || !this.dragDropInfo) {
      return;
    }

    const placeholderElement = this.dropListContainer.nativeElement.querySelector(".cdk-drag-placeholder");

    const receiverElement =
      this.dragDropInfo.dragIndex > this.dragDropInfo.dropIndex
        ? placeholderElement?.nextElementSibling
        : placeholderElement?.previousElementSibling;

    if (!receiverElement) {
      return;
    }

    receiverElement.style.display = "none";
    this.dropListReceiverElement = receiverElement;
  }

  dragDropped(event: CdkDragDrop<number>) {
    if (!this.dropListReceiverElement) {
      return;
    }

    this.dropListReceiverElement.style.removeProperty("display");
    this.dropListReceiverElement = undefined;
    this.dragDropInfo = undefined;
  }
}
