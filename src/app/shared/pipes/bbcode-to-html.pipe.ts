import { Pipe, PipeTransform, Renderer2 } from "@angular/core";
import { BBCodeService } from "@core/services/bbcode.service";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

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

  transform(value: string, renderer?: Renderer2): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(this.bbCodeService.transformBBCodeToHtml(value, renderer));
  }
}
