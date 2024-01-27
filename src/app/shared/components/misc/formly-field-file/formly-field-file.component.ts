import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { FieldType } from "@ngx-formly/core";
import { LoadingService } from "@shared/services/loading.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-formly-field-file",
  templateUrl: "./formly-field-file.component.html",
  styleUrls: ["./formly-field-file.component.scss"]
})
export class FormlyFieldFileComponent extends FieldType implements OnInit {
  @ViewChild("fileInput") el: ElementRef;

  selectedFiles: { file: File; url: SafeUrl }[];

  constructor(
    public readonly sanitizer: DomSanitizer,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    if (this.formControl.value) {
      if (UtilsService.isString(this.formControl.value)) {
        this.loadingService.setLoading(true);
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

  onDelete(event: Event) {
    event.stopPropagation();

    this.selectedFiles = [];
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
    this.selectedFiles = [];

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
}
