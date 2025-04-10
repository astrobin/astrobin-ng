import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import { UtilsService } from "@core/services/utils/utils.service";

@Pipe({
  name: "slugify"
})
export class SlugifyPipe implements PipeTransform {
  constructor() {}

  transform(value: string): string {
    return UtilsService.slugify(value);
  }
}
