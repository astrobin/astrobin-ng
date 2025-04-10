import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import { SafeHtml } from "@angular/platform-browser";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

@Pipe({
  name: "yesNoIcon"
})
export class YesNoIconPipe implements PipeTransform {
  transform(value: boolean): IconProp {
    return value ? "check" : "close";
  }
}
