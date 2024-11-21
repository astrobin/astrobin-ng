import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentService } from "@shared/services/equipment.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { selectEquipmentPreset } from "@features/equipment/store/equipment.selectors";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-equipment-preset",
  templateUrl: "./equipment-preset.component.html",
  styleUrls: ["./equipment-preset.component.scss"]
})
export class EquipmentPresetComponent extends BaseComponentDirective implements OnInit {
  @Input() preset: EquipmentPresetInterface;

  @Input() buttonOverlayLabel: string;

  @Output() readonly presetClicked = new EventEmitter<EquipmentPresetInterface>();

  @ViewChild("presetEditOffcanvas") presetEditOffcanvas: TemplateRef<any>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly loadingService: LoadingService,
    public readonly equipmentService: EquipmentService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService
  ) {
    super(store$);
  }

  ngOnInit() {
    this.store$.select(selectEquipmentPreset, { id: this.preset.id })
      .pipe(takeUntil(this.destroyed$))
      .subscribe((preset: EquipmentPresetInterface) => {
        this.preset = preset;
      });
  }

  onPresetDeleteClicked(preset: EquipmentPresetInterface) {
    this.equipmentService.deleteEquipmentPreset(preset).subscribe();
  }

  onPresetEditClicked(preset: EquipmentPresetInterface) {
    this.offcanvasService.open(this.presetEditOffcanvas, {
      panelClass: "preset-edit-offcanvas",
      position: this.deviceService.offcanvasPosition()
    });
  }
}
