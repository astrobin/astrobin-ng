import type { OnInit, TemplateRef } from "@angular/core";
import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { DeviceService } from "@core/services/device.service";
import type { EquipmentService } from "@core/services/equipment.service";
import type { LoadingService } from "@core/services/loading.service";
import { selectEquipmentPreset } from "@features/equipment/store/equipment.selectors";
import type { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import type { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
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
    this.store$
      .select(selectEquipmentPreset, { id: this.preset.id })
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
