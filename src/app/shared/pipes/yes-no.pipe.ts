import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";

@Pipe({
  name: "yesNo"
})
export class YesNoPipe implements PipeTransform {
  transform(value: boolean): string {
    return value ? "Yes" : "No";
  }
}
