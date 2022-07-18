import { Pipe, PipeTransform } from "@angular/core";
import { CKEditorService } from "@shared/services/ckeditor.service";
import { WindowRefService } from "@shared/services/window-ref.service";

@Pipe({
  name: "BBCodeToHtml"
})
export class BBCodeToHtmlPipe implements PipeTransform {
  constructor(public readonly ckEditorService: CKEditorService, public readonly windowRefService: WindowRefService) {}

  BBCodeToHtml(code) {
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
          // tslint:disable-next-line:no-conditional-assignment
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
        ol(element) {
          if (element.attributes.listType) {
            if (element.attributes.listType !== "decimal") {
              element.attributes.style = "list-style-type:" + element.attributes.listType;
            }
          } else {
            element.name = "ul";
          }

          delete element.attributes.listType;
        },
        a(element) {
          if (!element.attributes.href) {
            element.attributes.href = element.children[0].value;
          }
        },
        smiley(element) {
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
        }
      }
    });

    fragment.writeHtml(writer, bbcodeFilter);
    return writer.getHtml(true);
  }

  transform(value: string): string {
    return this.BBCodeToHtml(value);
  }
}
