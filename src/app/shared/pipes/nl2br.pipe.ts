import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import type { SafeHtml } from "@angular/platform-browser";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
  name: "nl2br"
})
export class Nl2BrPipe implements PipeTransform {
  constructor(public readonly sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) {
      return "";
    }
    return this.sanitizer.bypassSecurityTrustHtml(value.replace(/\n/g, "<br>"));
  }
}
