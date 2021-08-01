import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseEquipmentItemEditorComponent } from "@features/equipment/components/base-equipment-item-editor/base-equipment-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-camera-editor",
  templateUrl: "./camera-editor.component.html",
  styleUrls: ["./camera-editor.component.scss"]
})
export class CameraEditorComponent extends BaseEquipmentItemEditorComponent implements AfterContentInit {
  constructor(
    public readonly store$: Store,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$, actions$, loadingService, translateService, windowRefService);
  }

  ngAfterContentInit(): void {
    this.fields = [
      this._getBrandField(),
      this._getNameField(),
      {
        key: "cooled",
        type: "checkbox",
        id: "equipment-item-field-cooled",
        defaultValue: false,
        templateOptions: {
          label: this.translateService.instant("Cooled"),
          description: this.translateService.instant("Whether this camera is equipment with a cooling mechanism.")
        }
      },
      {
        key: "maxCooling",
        type: "input",
        id: "equipment-item-field-max-cooling",
        hideExpression: () => !this.model.cooled,
        templateOptions: {
          type: "number",
          min: 1,
          step: 1,
          label: this.translateService.instant("Max. cooling (Celsius degrees below ambient)"),
          description: this.translateService.instant(
            "A positive whole number that represents how many Celsius below ambient temperature this camera can " +
              "be cooled."
          )
        }
      },
      {
        key: "backFocus",
        type: "input",
        id: "equipment-item-field-back-focus",
        templateOptions: {
          type: "number",
          min: 1,
          step: 0.1,
          label: this.translateService.instant("Back focus (in mm)"),
          description: this.translateService.instant("Camera back focus in mm.")
        }
      }
    ];
  }
}
