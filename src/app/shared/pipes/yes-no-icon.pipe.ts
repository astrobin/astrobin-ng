import { Pipe, PipeTransform } from "@angular/core";
import { SafeHtml } from "@angular/platform-browser";

@Pipe({
  name: "yesNoIcon"
})
export class YesNoIconPipe implements PipeTransform {
  transform(value: boolean): SafeHtml {
    return value ? "check" : "close";
  }
}
