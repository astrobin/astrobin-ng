import { AfterContentInit, AfterViewInit, ChangeDetectorRef, Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseEquipmentItemEditorComponent } from "@features/equipment/components/base-equipment-item-editor/base-equipment-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { CameraInterface } from "@features/equipment/interfaces/camera.interface";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";

@Component({
  selector: "astrobin-camera-editor",
  templateUrl: "./camera-editor.component.html",
  styleUrls: ["./camera-editor.component.scss"]
})
export class CameraEditorComponent extends BaseEquipmentItemEditorComponent<CameraInterface>
  implements AfterContentInit {
  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService
  ) {
    super(store$, actions$, loadingService, translateService, windowRefService, equipmentApiService);
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
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
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
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
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
        expressionProperties: {
          "templateOptions.disabled": () => this.brandCreation.inProgress
        },
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
