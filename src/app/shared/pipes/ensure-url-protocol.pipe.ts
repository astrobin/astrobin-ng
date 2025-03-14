import { Pipe, PipeTransform } from "@angular/core";
import { UtilsService } from "@core/services/utils/utils.service";

@Pipe({
  name: "ensureUrlProtocol"
})
export class EnsureUrlProtocolPipe implements PipeTransform {
  transform(value: string, args?: any): string {
    return UtilsService.ensureUrlProtocol(value);
  }
}
