import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { FilterInterface, FilterSize, FilterType } from "@features/equipment/types/filter.interface";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
import { UtilsService } from "@shared/services/utils/utils.service";

export enum FilterDisplayProperty {
  TYPE = "TYPE",
  BANDWIDTH = "BANDWIDTH",
  SIZE = "SIZE"
}

@Injectable({
  providedIn: "root"
})
export class FilterService extends BaseService implements EquipmentItemServiceInterface {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService
  ) {
    super(loadingService);
  }

  humanizeType(type: FilterType) {
    const map = {
      [FilterType.H_ALPHA]: this.translateService.instant("Hydrogen-alpha (Hα)"),
      [FilterType.H_BETA]: this.translateService.instant("Hydrogen-beta (Hβ)"),
      [FilterType.SII]: this.translateService.instant("Sulfur-II (SII)"),
      [FilterType.OIII]: this.translateService.instant("Oxygen-III (OIII)"),
      [FilterType.NII]: this.translateService.instant("Nitrogen-II (NII)"),
      [FilterType.UV]: this.translateService.instant("Ultraviolet (UV)"),
      [FilterType.IR]: this.translateService.instant("Infrared (IR)"),
      [FilterType.UV_IR_CUT]: "UV/IR Cut",
      [FilterType.MULTIBAND]: this.translateService.instant("Multiband"),
      [FilterType.LP]: this.translateService.instant("Light pollution suppression"),
      [FilterType.L]: this.translateService.instant("Luminance/clear (L)"),
      [FilterType.R]: this.translateService.instant("Red channel (R)"),
      [FilterType.G]: this.translateService.instant("Green channel (G)"),
      [FilterType.B]: this.translateService.instant("Blue channel (B)"),
      [FilterType.ND]: this.translateService.instant("Neutral density (ND)"),
      [FilterType.UHC]: this.translateService.instant("Ultra High Contrast (UHC)"),
      [FilterType.SKY_GLOW]: this.translateService.instant("Sky glow"),
      [FilterType.SOLAR]: this.translateService.instant("Solar"),
      [FilterType.LUNAR]: this.translateService.instant("Lunar"),
      [FilterType.PLANETARY]: this.translateService.instant("Planetary"),
      [FilterType.COMETARY]: this.translateService.instant("Cometary"),
      [FilterType.PHOTOMETRIC_U]: this.translateService.instant("Photometric Ultraviolet"),
      [FilterType.PHOTOMETRIC_B]: this.translateService.instant("Photometric Blue"),
      [FilterType.PHOTOMETRIC_V]: this.translateService.instant("Photometric Visual"),
      [FilterType.PHOTOMETRIC_R]: this.translateService.instant("Photometric Red"),
      [FilterType.PHOTOMETRIC_I]: this.translateService.instant("Photometric Infrared"),
      [FilterType.OTHER]: this.translateService.instant("Other")
    };

    return map[type];
  }

  humanizeTypeShort(type: FilterType) {
    const map = {
      [FilterType.H_ALPHA]: "H-alpha",
      [FilterType.H_BETA]: "H-beta",
      [FilterType.SII]: "SII",
      [FilterType.OIII]: "OIII",
      [FilterType.NII]: "NII",
      [FilterType.UV]: "UV",
      [FilterType.IR]: "IR",
      [FilterType.UV_IR_CUT]: "UV/IR Cut",
      [FilterType.MULTIBAND]: "Multiband",
      [FilterType.LP]: "LP",
      [FilterType.L]: "Lum",
      [FilterType.R]: "Red",
      [FilterType.G]: "Green",
      [FilterType.B]: "Blue",
      [FilterType.ND]: "ND",
      [FilterType.UHC]: "UHC",
      [FilterType.SKY_GLOW]: "Sky glow",
      [FilterType.SOLAR]: "Solar",
      [FilterType.LUNAR]: "Lunar",
      [FilterType.PLANETARY]: "Planetary",
      [FilterType.COMETARY]: "Cometary",
      [FilterType.PHOTOMETRIC_U]: "Photometric UV",
      [FilterType.PHOTOMETRIC_B]: "Photometric B",
      [FilterType.PHOTOMETRIC_V]: "Photometric V",
      [FilterType.PHOTOMETRIC_R]: "Photometric R",
      [FilterType.PHOTOMETRIC_I]: "Photometric IR",
      [FilterType.OTHER]: null
    };

    return map[type];
  }

  humanizeSize(size: FilterSize) {
    const map = {
      [FilterSize.ROUND_1_25_IN]: this.translateService.instant("Round") + ` 1.25"`,
      [FilterSize.ROUND_2_IN]: this.translateService.instant("Round") + ` 2"`,
      [FilterSize.ROUND_27_MM]: this.translateService.instant("Round") + " 27 mm",
      [FilterSize.ROUND_31_MM]: this.translateService.instant("Round") + " 31 mm",
      [FilterSize.ROUND_36_MM]: this.translateService.instant("Round") + " 36 mm",
      [FilterSize.ROUND_42_MM]: this.translateService.instant("Round") + " 42 mm",
      [FilterSize.ROUND_46_MM]: this.translateService.instant("Round") + " 46 mm",
      [FilterSize.ROUND_50_MM]: this.translateService.instant("Round") + " 50 mm",
      [FilterSize.ROUND_52_MM]: this.translateService.instant("Round") + " 52 mm",
      [FilterSize.ROUND_62_MM]: this.translateService.instant("Round") + " 62 mm",
      [FilterSize.ROUND_65_MM]: this.translateService.instant("Round") + " 65 mm",
      [FilterSize.ROUND_67_MM]: this.translateService.instant("Round") + " 67 mm",
      [FilterSize.ROUND_72_MM]: this.translateService.instant("Round") + " 72 mm",
      [FilterSize.ROUND_77_MM]: this.translateService.instant("Round") + " 77 mm",
      [FilterSize.ROUND_82_MM]: this.translateService.instant("Round") + " 82 mm",
      [FilterSize.SQUARE_50_MM]: this.translateService.instant("Square") + " 50x50 mm",
      [FilterSize.SQUARE_65_MM]: this.translateService.instant("Square") + " 50x50 mm",
      [FilterSize.SQUARE_100_MM]: this.translateService.instant("Square") + " 100x100 mm",
      [FilterSize.RECT_101_143_MM]: this.translateService.instant("Rectangular") + " 101x143 mm",
      [FilterSize.EOS_APS_C]: "EOS APS-C",
      [FilterSize.EOS_FULL]: "EOS Full",
      [FilterSize.EOS_M]: "EOS M",
      [FilterSize.EOS_R]: "EOS R",
      [FilterSize.SONY]: "Sony",
      [FilterSize.SONY_FULL]: "Sony Full",
      [FilterSize.NIKON]: "Nikon",
      [FilterSize.NIKON_Z]: "Nikon Z",
      [FilterSize.NIKON_FULL]: "Nikon Full",
      [FilterSize.PENTAX]: "Pentax",
      [FilterSize.T_THREAD_CELL_M42]: "T-threaded cell (M42 x 0.75)",
      [FilterSize.M_52]: "M52",
      [FilterSize.SCT]: "SCT",
      [FilterSize.OTHER]: this.translateService.instant("Other")
    };

    return map[size];
  }

  humanizeSizeShort(size: FilterSize) {
    const map = {
      [FilterSize.ROUND_1_25_IN]: `1.25"`,
      [FilterSize.ROUND_2_IN]: ` 2"`,
      [FilterSize.ROUND_27_MM]: "27 mm",
      [FilterSize.ROUND_31_MM]: "31 mm",
      [FilterSize.ROUND_36_MM]: "36 mm",
      [FilterSize.ROUND_42_MM]: "42 mm",
      [FilterSize.ROUND_46_MM]: "46 mm",
      [FilterSize.ROUND_50_MM]: "50 mm",
      [FilterSize.ROUND_52_MM]: "52 mm",
      [FilterSize.ROUND_62_MM]: "62 mm",
      [FilterSize.ROUND_65_MM]: "65 mm",
      [FilterSize.ROUND_67_MM]: "67 mm",
      [FilterSize.ROUND_72_MM]: "72 mm",
      [FilterSize.ROUND_77_MM]: "77 mm",
      [FilterSize.ROUND_82_MM]: "82 mm",
      [FilterSize.SQUARE_50_MM]: "50x50 mm",
      [FilterSize.SQUARE_65_MM]: "50x50 mm",
      [FilterSize.SQUARE_100_MM]: "100x100 mm",
      [FilterSize.RECT_101_143_MM]: "101x143 mm",
      [FilterSize.EOS_APS_C]: "EOS APS-C",
      [FilterSize.EOS_FULL]: "EOS Full",
      [FilterSize.EOS_M]: "EOS M",
      [FilterSize.EOS_R]: "EOS R",
      [FilterSize.SONY]: "Sony",
      [FilterSize.SONY_FULL]: "Sony Full",
      [FilterSize.NIKON]: "Nikon",
      [FilterSize.NIKON_Z]: "Nikon Z",
      [FilterSize.NIKON_FULL]: "Nikon Full",
      [FilterSize.PENTAX]: "Pentax",
      [FilterSize.T_THREAD_CELL_M42]: "M42x0.75",
      [FilterSize.M_52]: "M52",
      [FilterSize.SCT]: "SCT",
      [FilterSize.OTHER]: null
    };

    return map[size];
  }

  getSupportedPrintableProperties(): string[] {
    return [FilterDisplayProperty.TYPE, FilterDisplayProperty.BANDWIDTH, FilterDisplayProperty.SIZE];
  }

  getPrintableProperty$(
    item: FilterInterface,
    property: FilterDisplayProperty,
    propertyValue?: any
  ): Observable<string | null> {
    switch (property) {
      case FilterDisplayProperty.TYPE:
        return of(this.humanizeType(propertyValue || item.type));
      case FilterDisplayProperty.BANDWIDTH:
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.bandwidth ? `${propertyValue || item.bandwidth} nm` : "");
      case FilterDisplayProperty.SIZE:
        return of(this.humanizeSize(propertyValue || item.size));
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }

  getPrintablePropertyName(propertyName: FilterDisplayProperty, shortForm = false): string {
    switch (propertyName) {
      case FilterDisplayProperty.TYPE:
        return this.translateService.instant("Type");
      case FilterDisplayProperty.BANDWIDTH:
        return shortForm
          ? this.translateService.instant("Bandwidth")
          : this.translateService.instant("Bandwidth") + " (nm)";
      case FilterDisplayProperty.SIZE:
        return this.translateService.instant("Size");
      default:
        throw Error(`Invalid property: ${propertyName}`);
    }
  }
}
