import { Injectable, Inject, PLATFORM_ID, Renderer2 } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";
import { isPlatformServer } from "@angular/common";
import { WindowRefService } from "@core/services/window-ref.service";
import { CKEditorService } from "@core/services/ckeditor.service";
import { catchError, map } from "rxjs/operators";
import { of } from "rxjs";

@Injectable({ providedIn: 'root' })
export class BBCodeService {
  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly windowRefService: WindowRefService,
    private readonly ckEditorService: CKEditorService,
    private readonly http: HttpClient
  ) {}

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
    const bbcodeFilter = new CKEDITOR.htmlParser.filter();

    bbcodeFilter.addRules({
      elements: {
        blockquote: (element) => {
          const quoted = new CKEDITOR.htmlParser.element("div");
          quoted.children = element.children;
          element.children = [quoted];
          const citeText = element.attributes.cite;
          if (citeText) {
            const cite = new CKEDITOR.htmlParser.element("cite");
            cite.add(new CKEDITOR.htmlParser.text(citeText.replace(/^"|"$/g, "")));
            delete element.attributes.cite;
            element.children.unshift(cite);
          }
        },
        span: (element) => {
          let bbcode;
          if ((bbcode = element.attributes.bbcode)) {
            if (bbcode === "img") {
              element.name = "img";
              element.attributes.src = element.children[0].value;
              element.children = [];
            } else if (bbcode === "email") {
              element.name = "a";
              element.attributes.href = "mailto:" + element.children[0].value;
            }
            delete element.attributes.bbcode;
          }
        },
        ol: (element) => {
          if (element.attributes.listType) {
            if (element.attributes.listType !== "decimal") {
              element.attributes.style = "list-style-type:" + element.attributes.listType;
            }
          } else {
            element.name = "ul";
          }
          delete element.attributes.listType;
        },
        a: (element) => {
          if (!element.attributes.href) {
            element.attributes.href = element.children[0].value;
          }
        },
        smiley: (element) => {
          element.name = "img";
          const editorConfig = this.ckEditorService.options(null);
          const description = element.attributes.desc;
          const image =
            editorConfig.smiley_images[CKEDITOR.tools.indexOf(editorConfig.smiley_descriptions, description)];
          const src = CKEDITOR.tools.htmlEncode(editorConfig.smiley_path + image);

          element.attributes = {
            src,
            "data-cke-saved-src": src,
            class: "smiley",
            title: description,
            alt: description
          };
        },
        img: (element) => {
          if (!renderer) {
            return;
          }

          const src: string = element.attributes.src;
          const placeholderSrc = "/assets/images/loading.gif";

          if (src && src.indexOf("/ckeditor-files/") > 0) {
            element.attributes.src = placeholderSrc;

            const fileName = "f" + src.split("/").pop().split(".")[0].replace(/-/gi, "");
            element.attributes.class = `loading ${fileName}`;

            this._fetchThumbnail(src, (thumbnailSrc) => {
              setTimeout(() => {
                const imgElement = this.windowRefService.nativeWindow.document.querySelector(
                  `img.${fileName}`
                );
                if (imgElement) {
                  renderer.setAttribute(imgElement, "src", thumbnailSrc);
                  renderer.setAttribute(imgElement, "data-src", src);
                  renderer.removeClass(imgElement, "loading");
                  renderer.removeClass(imgElement, `${fileName}`);
                }
              });
            });
          }
        }
      }
    });

    fragment.writeHtml(writer, bbcodeFilter);
    return writer.getHtml(true);
  }

  private _fetchThumbnail(src: string, callback: (thumbnailSrc: string) => void) {
    const urlPath = new URL(src, this.windowRefService.nativeWindow.location.origin).pathname.slice(1);
    const url = `${environment.classicBaseUrl}/json-api/common/ckeditor-upload/?path=${encodeURIComponent(urlPath)}`;

    this.http
      .get<{ thumbnail: string }>(url)
      .pipe(
        map((response) => response.thumbnail),
        catchError((error) => {
          console.error("Error fetching thumbnail:", error);
          return of(src);
        })
      )
      .subscribe((thumbnail) => {
        if (thumbnail) {
          callback(thumbnail);
        } else {
          callback(src);
        }
      });
  }
}
