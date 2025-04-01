import { Pipe, PipeTransform } from "@angular/core";
import { SafeHtml } from "@angular/platform-browser";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

@Pipe({
  name: "yesNoIcon"
})
export class YesNoIconPipe implements PipeTransform {
  transform(value: boolean): IconProp {
    return value ? "check" : "close";
  }
}
