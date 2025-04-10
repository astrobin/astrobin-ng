import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";

@Pipe({
  name: "nullOrUndefined"
})
export class NullOrUndefinedPipe implements PipeTransform {
  transform<T>(value: T | null | undefined): T | string {
    if (value === null || value === undefined) {
      return "n/a";
    }
    return value;
  }
}
