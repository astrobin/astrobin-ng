import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
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

  selectedFile: { file: File; url: SafeUrl };

  constructor(
    public readonly sanitizer: DomSanitizer,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService
  ) {
    super();
  }

  ngOnInit() {
    if (this.formControl.value) {
      this.loadingService.setLoading(true);
      UtilsService.fileFromUrl(this.formControl.value).then((file: File) => {
        this._setValueFromFile(file);
        this.loadingService.setLoading(false);
      });
    }
  }

  openFileInput() {
    this.el.nativeElement.click();
  }

  onDelete(event: Event) {
    event.stopPropagation();

    this.selectedFile = null;
    this.formControl.setValue(this.selectedFile);
    this.formControl.markAsTouched();
    this.formControl.markAsDirty();
  }

  onChange(event: any) {
    this._setValueFromFile(event.target.files.item(0));
    this.formControl.markAsTouched();
    this.formControl.markAsDirty();
  }

  isImage(file: File): boolean {
    return /^image\//.test(file.type);
  }

  _setValueFromFile(file: File) {
    this.selectedFile = {
      file,
      url: this.sanitizer.bypassSecurityTrustUrl(
        (this.windowRefService.nativeWindow as any).URL.createObjectURL(file)
      )
    };

    this.formControl.patchValue([this.selectedFile]);
  }
}
