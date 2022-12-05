import { AfterViewInit, ChangeDetectorRef, Component, Inject, PLATFORM_ID } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { CKEditorService } from "@shared/services/ckeditor.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { isPlatformServer } from "@angular/common";

declare const CKEDITOR: any;

@Component({
  selector: "astrobin-formly-field-ckeditor",
  templateUrl: "./formly-field-ckeditor.component.html",
  styleUrls: ["./formly-field-ckeditor.component.scss"]
})
export class FormlyFieldCKEditorComponent extends FieldType implements AfterViewInit {
  editor;
  showEditor = false;

  constructor(
    public readonly translateService: TranslateService,
    public readonly ckeditorService: CKEditorService,
    public readonly utilsService: UtilsService,
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngAfterViewInit() {
    this._initialize();
  }

  private _showEditor(): void {
    this.utilsService.delay(100).subscribe(() => {
      if (this.editor?.instanceReady) {
        this.showEditor = true;
        this.changeDetectorRef.detectChanges();
      } else {
        this._showEditor();
      }
    });
  }

  private _initialize(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const document = this.windowRefService.nativeWindow.document;
    const editorBase = document.getElementById(this.field.id);

    if (CKEDITOR && editorBase && !this.editor) {
      // Bump this anytime a plugin or other CKEDITOR resource is updated.
      CKEDITOR.timestamp = "2022-07-16";

      this.editor = CKEDITOR.replace(this.field.id, this.ckeditorService.options(this.formControl));
      this.editor.setData(this.formControl.value);

      this._showEditor();
    } else {
      this.utilsService.delay(100).subscribe(() => {
        this._initialize();
      });
    }
  }
}
