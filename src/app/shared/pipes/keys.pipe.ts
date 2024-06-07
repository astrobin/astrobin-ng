import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "keys" })
export class KeysPipe implements PipeTransform {
  transform(value: any): any {
    const keys = [];
    for (let key in value) {
      if (value.hasOwnProperty(key)) {
        keys.push({ key: key, value: value[key] });
      }
    }
    return keys;
  }
}
