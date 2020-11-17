import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class UtilsService {
  uuid(): string {
    const S4 = (): string => {
      // tslint:disable-next-line:no-bitwise
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    return `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
  }

  fileExtension(filename: string): string | undefined {
    const separator = ".";

    if (!filename || filename.indexOf(separator) === -1) {
      return undefined;
    }

    return filename.split(separator).pop();
  }

  isImage(filename: string): boolean {
    if (!filename) {
      return false;
    }

    const extension = this.fileExtension(filename).toLowerCase();
    return ["png", "jpg", "jpeg", "gif"].indexOf(extension) > -1;
  }
}
