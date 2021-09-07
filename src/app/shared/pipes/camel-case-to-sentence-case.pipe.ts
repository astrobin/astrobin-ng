import { Pipe, PipeTransform } from "@angular/core";
import { UtilsService } from "@shared/services/utils/utils.service";

@Pipe({
  name: "camelCaseToSentenceCase"
})
export class CamelCaseToSentenceCasePipe implements PipeTransform {
  transform(value: string): string {
    return UtilsService.camelCaseToSentenceCase(value);
  }
}
