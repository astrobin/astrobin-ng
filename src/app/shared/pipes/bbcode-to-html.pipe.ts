import { ChangeDetectorRef, Inject, Pipe, PipeTransform, PLATFORM_ID, Renderer2, RendererFactory2 } from "@angular/core";
import { CKEditorService } from "@shared/services/ckeditor.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { isPlatformServer } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";

@Pipe({
  name: "BBCodeToHtml"
})
export class BBCodeToHtmlPipe implements PipeTransform {
  private readonly _imageMap: {[key: string]: string} = {};

  constructor(
    public readonly ckEditorService: CKEditorService,
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly http: HttpClient,
    public readonly renderer?: Renderer2
  ) {
  }

  BBCodeToHtml(code) {
    if (isPlatformServer(this.platformId)) {
      return code;
    }

    const window = this.windowRefService.nativeWindow as any;
    const CKEDITOR = window.CKEDITOR;

    const fragment = CKEDITOR.htmlParser.fragment.fromBBCode(code);
    const writer = new CKEDITOR.htmlParser.basicWriter();
    const bbcodeFilter = new CKEDITOR.htmlParser.filter();

    bbcodeFilter.addRules({
      elements: {
        blockquote: element => {
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
        span: element => {
          let bbcode;
          // eslint-disable-next-line no-cond-assign
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
        ol: element => {
          if (element.attributes.listType) {
            if (element.attributes.listType !== "decimal") {
              element.attributes.style = "list-style-type:" + element.attributes.listType;
            }
          } else {
            element.name = "ul";
          }

          delete element.attributes.listType;
        },
        a: element => {
          if (!element.attributes.href) {
            element.attributes.href = element.children[0].value;
          }
        },
        smiley: element => {
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
        img: element => {
          if (!this.renderer) {
            return;
          }

          const src: string = element.attributes.src;
          const placeholderSrc = "/assets/images/loading.gif"; // Set a placeholder image path here

          if (src && src.indexOf("/ckeditor-files/") > 0) {
            // Set the placeholder image initially
            element.attributes.src = placeholderSrc;

            // Parse file name out of src
            const fileName = 'f' + src.split("/").pop().split(".")[0].replace(/-/gi, "");
            element.attributes.class = `loading ${fileName}`;

            // Fetch the thumbnail asynchronously and update the src attribute
            this._fetchThumbnail(src, thumbnailSrc => {
              setTimeout(() => {
                const imgElement = this.windowRefService.nativeWindow.document.querySelector(
                  `img.${fileName}`
                );
                if (imgElement) {
                  this.renderer.setAttribute(imgElement, "src", thumbnailSrc);
                  this.renderer.setAttribute(imgElement, "data-src", src);
                  this.renderer.removeClass(imgElement, "loading");
                  this.renderer.removeClass(imgElement, `${fileName}`);
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

  transform(value: string): string {
    return this.BBCodeToHtml(value);
  }

  private _fetchThumbnail(src: string, callback: (thumbnailSrc: string) => void) {
    const urlPath = new URL(src, this.windowRefService.nativeWindow.location.origin).pathname.slice(1);
    const url = `${environment.classicBaseUrl}/json-api/common/ckeditor-upload/?path=${encodeURIComponent(urlPath)}`;

    this.http.get<{ thumbnail: string }>(url).subscribe(
      response => {
        if (response.thumbnail) {
          callback(response.thumbnail);
        }
      },
      error => {
        console.error("Error fetching thumbnail:", error);
        // Optionally handle the error or replace with a fallback image
      }
    );
  }
}
