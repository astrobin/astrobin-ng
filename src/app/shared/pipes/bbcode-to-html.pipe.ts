import { Pipe, PipeTransform, Renderer2 } from "@angular/core";
import { BBCodeService } from "@core/services/bbcode.service";

@Pipe({
  name: "BBCodeToHtml"
})
export class BBCodeToHtmlPipe implements PipeTransform {
  constructor(private readonly bbCodeService: BBCodeService) {
  }

  transform(value: string, renderer?: Renderer2): string {
    return this.bbCodeService.transformBBCodeToHtml(value);
  }
}
