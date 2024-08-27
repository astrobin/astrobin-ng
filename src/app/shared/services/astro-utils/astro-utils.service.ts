import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class AstroUtilsService {
  formatRa(value: number): string {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return `${hours}h ${minutes.toFixed(2).replace(".00", "")}m`;
  }

  formatDec(value: number): string {
    const degrees = Math.floor(value);
    const minutes = Math.abs(value - degrees) * 60;
    return `${degrees}° ${minutes.toFixed(2).replace(".00", "")}'`;
  }
}
