import { AfterViewInit, Component, Inject, PLATFORM_ID } from "@angular/core";
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
  showEditor = false;

  constructor(
    public readonly translateService: TranslateService,
    public readonly ckeditorService: CKEditorService,
    public readonly utilsService: UtilsService,
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId
  ) {
    super();
  }

  ngAfterViewInit() {
    this._initialize();
  }

  private _initialize(): void {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    const document = this.windowRefService.nativeWindow.document;
    const editorBase = document.getElementById(this.field.id);

    if (CKEDITOR && editorBase) {
      // Bump this anytime a plugin or other CKEDITOR resource is updated.
      CKEDITOR.timestamp = "2022-07-16";

      const editor = CKEDITOR.replace(this.field.id, this.ckeditorService.options(this.formControl));
      editor.setData(this.formControl.value);

      editor.on("instanceReady", () => {
        this.showEditor = true;
      });
    } else {
      this.utilsService.delay(100).subscribe(() => {
        this._initialize();
      });
    }
  }
}
