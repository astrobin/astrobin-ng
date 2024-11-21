import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { EquipmentActionTypes, FindEquipmentPresets, FindEquipmentPresetsFailure, FindEquipmentPresetsSuccess } from "@features/equipment/store/equipment.actions";
import { Subscription } from "rxjs";
import { selectEquipmentPresets } from "@features/equipment/store/equipment.selectors";
import { filter, map, take } from "rxjs/operators";
import { distinctUntilChangedObj } from "@shared/services/utils/utils.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { SmartFolderType } from "@features/users/pages/gallery/user-gallery-smart-folders.component";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { Actions, ofType } from "@ngrx/effects";

@Component({
  selector: "astrobin-user-gallery-equipment",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="mb-5">
        <h4 class="mb-3">{{ "Setups" | translate }}</h4>

        <astrobin-loading-indicator *ngIf="loadingPresets"></astrobin-loading-indicator>

        <div *ngIf="!loadingPresets && presets?.length === 0">
          <span *ngIf="currentUserWrapper.user?.id !== user.id" class="text-muted">
            {{ "This user doesn't have any equipment setups." | translate }}
          </span>

          <div
            *ngIf="currentUserWrapper.user?.id === user.id"
            (click)="onPresetCreateClicked()"
            class="create-preset"
          >
            <fa-icon icon="plus"></fa-icon>
            <span translate="Add setup"></span>
          </div>
        </div>

        <ng-container *ngIf="!loadingPresets && presets?.length > 0">
          <div class="d-flex flex-wrap gap-3">
            <astrobin-equipment-preset
              *ngFor="let preset of presets"
              (presetClicked)="onPresetClicked(preset)"
              [preset]="preset"
            ></astrobin-equipment-preset>

            <div
              *ngIf="currentUserWrapper.user?.id === user.id"
              (click)="onPresetCreateClicked()"
              class="create-preset"
            >
              <fa-icon icon="plus"></fa-icon>
              <span translate="Add setup"></span>
            </div>
          </div>
        </ng-container>
      </div>

      <astrobin-user-gallery-smart-folder
        (activeChange)="activeEquipmentItemChange.emit($event)"
        [user]="user"
        [userProfile]="userProfile"
        [folderType]="SmartFolderType.GEAR"
        galleryFragment="equipment"
      ></astrobin-user-gallery-smart-folder>
    </ng-container>

    <ng-template #presetSummaryOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ activePreset.name }}</h5>
        <button type="button" class="btn-close" (click)="offcanvas.close()"></button>
      </div>
      <div class="offcanvas-body">
        <astrobin-equipment-preset-summary
          [preset]="activePreset"
        ></astrobin-equipment-preset-summary>
      </div>
    </ng-template>

    <ng-template #presetCreateOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Add setup" | translate }}</h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Close"
          (click)="offcanvas.close()"
        ></button>
      </div>

      <div class="offcanvas-body">
        <astrobin-equipment-preset-editor
          [preset]="null"
          (presetSaved)="offcanvas.close()"
        ></astrobin-equipment-preset-editor>
      </div>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-equipment.component.scss"]
})
export class UserGalleryEquipmentComponent extends BaseComponentDirective implements OnInit, OnChanges, OnDestroy {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  @Output() activeEquipmentItemChange = new EventEmitter<string>();

  @ViewChild("presetSummaryOffcanvas") presetSummaryOffcanvas: TemplateRef<any>;
  @ViewChild("presetCreateOffcanvas") presetCreateOffcanvas: TemplateRef<any>;

  protected loadingPresets = true;
  protected presets: EquipmentPresetInterface[] = null;
  protected activePreset: EquipmentPresetInterface = null;
  protected readonly SmartFolderType = SmartFolderType;

  private _presetsSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user) {
      this.loadingPresets = true;

      if (this._presetsSubscription) {
        this._presetsSubscription.unsubscribe();
      }

      this.actions$.pipe(
        ofType(
          EquipmentActionTypes.FIND_EQUIPMENT_PRESETS_SUCCESS,
          EquipmentActionTypes.FIND_EQUIPMENT_PRESETS_FAILURE
        ),
        filter((action: FindEquipmentPresetsSuccess | FindEquipmentPresetsFailure) => action.payload.userId === this.user.id),
        take(1)
      ).subscribe(() => {
        this.loadingPresets = false;
      });

      this._presetsSubscription = this.store$.select(selectEquipmentPresets)
        .pipe(
          map(presets => presets.filter(preset => preset.user === this.user.id)),
          distinctUntilChangedObj()
        )
        .subscribe(presets => {
          this.presets = presets;
        });

      this.store$.dispatch(new FindEquipmentPresets({ userId: this.user.id }));
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    if (this._presetsSubscription) {
      this._presetsSubscription.unsubscribe();
    }
  }

  protected onPresetClicked(preset: EquipmentPresetInterface): void {
    this.activePreset = preset;
    const offcanvas = this.offcanvasService.open(this.presetSummaryOffcanvas, {
      panelClass: "preset-summary-offcanvas",
      position: this.deviceService.offcanvasPosition()
    });

    offcanvas.dismissed.subscribe(() => {
      this.activePreset = null;
    });
  }

  protected onPresetCreateClicked(): void {
    this.offcanvasService.open(this.presetCreateOffcanvas, {
      panelClass: "preset-create-offcanvas",
      position: this.deviceService.offcanvasPosition()
    });
  }

}
