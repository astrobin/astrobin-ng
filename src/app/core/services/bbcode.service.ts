import { Inject, Injectable, PLATFORM_ID, Renderer2 } from "@angular/core";
import { isPlatformServer } from "@angular/common";
import { WindowRefService } from "@core/services/window-ref.service";
import { CKEditorService } from "@core/services/ckeditor.service";

@Injectable({ providedIn: "root" })
export class BBCodeService {
  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly windowRefService: WindowRefService,
    private readonly ckEditorService: CKEditorService
  ) {
  }

  transformBBCodeToHtml(
    code: string,
    renderer?: Renderer2
  ): string {
    if (isPlatformServer(this.platformId)) {
      return code;
    }

    const window = this.windowRefService.nativeWindow as any;
    const CKEDITOR = window.CKEDITOR;

    if (!CKEDITOR || !CKEDITOR.htmlParser) {
      return code;
    }

    const fragment = CKEDITOR.htmlParser.fragment.fromBBCode(code);
    const writer = new CKEDITOR.htmlParser.basicWriter();
    const bbcodeFilter = this.ckEditorService.setupBBCodeFilter(renderer);

    fragment.writeHtml(writer, bbcodeFilter);
    return writer.getHtml(true);
  }
}
