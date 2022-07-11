import { AfterViewInit, Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseItemEditorComponent } from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormlyFieldMessageLevel, FormlyFieldService } from "@shared/services/formly-field.service";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { take } from "rxjs/operators";
import { interval } from "rxjs";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-software-editor",
  templateUrl: "./software-editor.component.html",
  styleUrls: ["./software-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class SoftwareEditorComponent extends BaseItemEditorComponent<SoftwareInterface, null>
  implements OnInit, AfterViewInit {
  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService
  ) {
    super(
      store$,
      actions$,
      loadingService,
      translateService,
      windowRefService,
      equipmentApiService,
      equipmentItemService,
      formlyFieldService,
      modalService,
      utilsService
    );
  }

  ngOnInit() {
    if (!this.returnToSelector) {
      this.returnToSelector = "#software-editor-form";
    }
  }

  ngAfterViewInit(): void {
    this.utilsService.delay(1).subscribe(() => {
      this._initFields();
    });

    this.model.klass = EquipmentItemType.SOFTWARE;

    super.ngAfterViewInit();
  }

  protected _customNameChangesValidations(field: FormlyFieldConfig, value: string) {
    const hasNumbers: boolean = /\d/.test(value);

    if (hasNumbers) {
      this.formlyFieldService.addMessage(field.templateOptions, {
        level: FormlyFieldMessageLevel.INFO,
        text: this.translateService.instant(
          "The AstroBin equipment database does not attempt to track version numbers of software. " +
            "If that number is a version number, please remove it, thanks!"
        )
      });
    }
  }

  private _initFields() {
    this.initBrandAndName().subscribe(() => {
      this.fields = [
        this._getDIYField(),
        this._getBrandField(
          `${this.translateService.instant("Brand")} / ` +
            `${this.translateService.instant("Company")} / ` +
            this.translateService.instant("Developer(s)")
        ),
        this._getNameField(),
        this._getVariantOfField(EquipmentItemType.SOFTWARE),
        this._getWebsiteField(),
        this._getImageField(),
        this._getCommunityNotesField()
      ];

      this._addBaseItemEditorFields();
    });
  }
}
