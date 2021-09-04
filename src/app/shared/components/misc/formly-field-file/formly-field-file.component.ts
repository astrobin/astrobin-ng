import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { FieldType } from "@ngx-formly/core";

@Component({
  selector: "astrobin-formly-field-file",
  templateUrl: "./formly-field-file.component.html",
  styleUrls: ["./formly-field-file.component.scss"]
})
export class FormlyFieldFileComponent extends FieldType implements OnInit {
  @ViewChild("fileInput") el: ElementRef;

  selectedFiles: File[];

  constructor(public sanitizer: DomSanitizer) {
    super();
  }

  ngOnInit(): void {}

  openFileInput() {
    this.el.nativeElement.click();
  }

  onDelete(index) {
    this.selectedFiles.splice(index, 1);
    this.formControl.patchValue(this.selectedFiles);
  }

  onChange(event) {
    this.selectedFiles = Array.from(event.target.files);
  }

  getSanitizedImageUrl(file: File) {
    return this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
  }

  isImage(file: File): boolean {
    return /^image\//.test(file.type);
  }
}
