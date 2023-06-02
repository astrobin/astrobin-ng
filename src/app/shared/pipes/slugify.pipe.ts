import { Pipe, PipeTransform } from "@angular/core";
import { UtilsService } from "@shared/services/utils/utils.service";

@Pipe({
  name: "slugify"
})
export class SlugifyPipe implements PipeTransform {
  constructor() {
  }

  transform(value: string): string {
    return UtilsService.slugify(value);
  }
}
