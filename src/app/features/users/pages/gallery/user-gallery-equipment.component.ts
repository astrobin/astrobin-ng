import {
  ChangeDetectorRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from "@angular/core";
import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { FindImagesResponseInterface } from "@core/services/api/classic/images/image/image-api.service";
import { DeviceService } from "@core/services/device.service";
import { distinctUntilChangedObj } from "@core/services/utils/utils.service";
import {
  FindEquipmentPresetsFailure,
  FindEquipmentPresetsSuccess,
  EquipmentActionTypes,
  FindEquipmentPresets
} from "@features/equipment/store/equipment.actions";
import { selectEquipmentPresets } from "@features/equipment/store/equipment.selectors";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { SmartFolderType } from "@features/users/pages/gallery/user-gallery-smart-folders.component";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Subscription } from "rxjs";
import { filter, map, take } from "rxjs/operators";

@Component({
  selector: "astrobin-user-gallery-equipment",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="mb-5">
        <h4 class="mb-3">
          {{ "Setups" | translate }}
          <small>
            {{ "Setups are saved combinations of equipment for quick association with one's images." | translate }}
          </small>
        </h4>

        <astrobin-loading-indicator *ngIf="loadingPresets"></astrobin-loading-indicator>

        <div *ngIf="!loadingPresets && presets?.length === 0">
          <span *ngIf="currentUserWrapper.user?.id !== user.id" class="text-muted">
            {{ "This user doesn't have any equipment setups." | translate }}
          </span>

          <div *ngIf="currentUserWrapper.user?.id === user.id" (click)="onPresetCreateClicked()" class="create-preset">
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
        <astrobin-equipment-preset-summary [preset]="activePreset"></astrobin-equipment-preset-summary>
      </div>
    </ng-template>

    <ng-template #presetCreateOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Add setup" | translate }}</h5>
        <button type="button" class="btn-close" aria-label="Close" (click)="offcanvas.close()"></button>
      </div>

      <div class="offcanvas-body">
        <astrobin-equipment-preset-editor
          [preset]="null"
          (presetSaved)="offcanvas.close()"
        ></astrobin-equipment-preset-editor>
      </div>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-equipment.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryEquipmentComponent extends BaseComponentDirective implements OnInit, OnChanges, OnDestroy {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  @Output() activeEquipmentItemChange = new EventEmitter<{
    active: string;
    menu: FindImagesResponseInterface["menu"];
  }>();

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
    public readonly deviceService: DeviceService,
    public readonly changeDetectorRef: ChangeDetectorRef
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

      this.actions$
        .pipe(
          ofType(
            EquipmentActionTypes.FIND_EQUIPMENT_PRESETS_SUCCESS,
            EquipmentActionTypes.FIND_EQUIPMENT_PRESETS_FAILURE
          ),
          filter(
            (action: FindEquipmentPresetsSuccess | FindEquipmentPresetsFailure) =>
              action.payload.userId === this.user.id
          ),
          take(1)
        )
        .subscribe(() => {
          this.loadingPresets = false;
          this.changeDetectorRef.markForCheck();
        });

      this._presetsSubscription = this.store$
        .select(selectEquipmentPresets)
        .pipe(
          map(presets => presets.filter(preset => preset.user === this.user.id)),
          distinctUntilChangedObj()
        )
        .subscribe(presets => {
          this.presets = presets;
          this.changeDetectorRef.markForCheck();
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
