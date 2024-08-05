import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class AstroUtilsService {
  formatRa(value: number): string {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return `${hours}h ${minutes}m`;
  }

  formatDec(value: number): string {
    const degrees = Math.floor(value);
    const minutes = Math.abs(value - degrees) * 60;
    return `${degrees}° ${Math.trunc(minutes)}'`;
  }
}
