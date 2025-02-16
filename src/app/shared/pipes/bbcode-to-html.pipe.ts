import { Pipe, PipeTransform, Renderer2, SecurityContext } from "@angular/core";
import { BBCodeService } from "@core/services/bbcode.service";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
  name: "BBCodeToHtml",
  pure: true
})
export class BBCodeToHtmlPipe implements PipeTransform {
  constructor(
    public readonly bbCodeService: BBCodeService,
    public readonly domSanitizer: DomSanitizer

  ) {
  }

  transform(value: string, renderer?: Renderer2): string {
    return this.domSanitizer.sanitize(
      SecurityContext.HTML, this.bbCodeService.transformBBCodeToHtml(value, renderer)
    ) || '';
  }
}
