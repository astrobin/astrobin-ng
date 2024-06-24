import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({
  name: "nl2br"
})
export class Nl2BrPipe implements PipeTransform {
  constructor(public readonly sanitizer: DomSanitizer) {
  }

  transform(value: string): SafeHtml {
    if (!value) {
      return "";
    }
    return this.sanitizer.bypassSecurityTrustHtml(value.replace(/\n/g, "<br>"));
  }
}
