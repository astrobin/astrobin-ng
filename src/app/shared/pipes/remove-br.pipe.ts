import { PipeTransform, Pipe } from "@angular/core";

@Pipe({
  name: "removeBr"
})
export class RemoveBrPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return value;
    }

    // Replace multiple <br> tags with a single <br>
    let result = value.replace(/(<br\s*\/?>\s*){2,}/gi, "<br>");

    // Remove leading <br> tags
    result = result.replace(/^(<br\s*\/?>)+/gi, "");

    // Remove trailing <br> tags
    result = result.replace(/(<br\s*\/?>)+$/gi, "");

    return result;
  }
}
