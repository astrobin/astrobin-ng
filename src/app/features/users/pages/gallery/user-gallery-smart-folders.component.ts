import {
  ChangeDetectorRef,
  OnInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { FindImagesResponseInterface } from "@core/services/api/classic/images/image/image-api.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { fadeInOut } from "@shared/animations";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { takeUntil } from "rxjs/operators";

export enum SmartFolderType {
  YEAR = "year",
  GEAR = "gear",
  SUBJECT = "subject",
  CONSTELLATION = "constellation",
  NO_DATA = "nodata"
}

@Component({
  selector: "astrobin-user-gallery-smart-folders",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div *ngIf="!activeFolderType" class="d-flex flex-wrap gap-4 justify-content-center">
        <ng-container *ngFor="let smartFolder of smartFolders">
          <a
            *ngIf="!smartFolder.onlyOwner || currentUserWrapper.user?.id === user.id"
            [routerLink]="['/u', user.username]"
            [queryParams]="{ 'folder-type': smartFolder.type }"
            fragment="smart-folders"
            class="smart-folder-category"
          >
            <div class="smart-folder-background"></div>
            <div class="smart-folder-stars"></div>
            <div class="smart-folder">
              <div class="icon">
                <fa-icon *ngIf="smartFolder.icon" [icon]="smartFolder.icon"></fa-icon>
                <img *ngIf="smartFolder.image" [src]="smartFolder.image" alt="" />
              </div>
              <div class="name">
                {{ smartFolder.name }}
                <fa-icon
                  *ngIf="smartFolder.onlyOwner"
                  [ngbTooltip]="'Only you can see this folder.' | translate"
                  class="ms-2"
                  container="body"
                  icon="lock"
                ></fa-icon>
              </div>
            </div>
          </a>
        </ng-container>
      </div>

      <astrobin-user-gallery-smart-folder
        *ngIf="activeFolderType"
        (activeChange)="activeChange.emit($event)"
        [user]="user"
        [userProfile]="userProfile"
        [folderType]="activeFolderType"
      ></astrobin-user-gallery-smart-folder>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-smart-folders.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGallerySmartFoldersComponent extends BaseComponentDirective implements OnInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  @Output() readonly activeChange = new EventEmitter<{
    active: string;
    menu: FindImagesResponseInterface["menu"];
  }>();

  public readonly smartFolders = [
    {
      type: SmartFolderType.YEAR,
      name: this.translateService.instant("Years"),
      icon: "calendar"
    },
    {
      type: SmartFolderType.GEAR,
      name: this.translateService.instant("Equipment"),
      icon: "camera"
    },
    {
      type: SmartFolderType.SUBJECT,
      name: this.translateService.instant("Subject types"),
      icon: "star"
    },
    {
      type: SmartFolderType.CONSTELLATION,
      name: this.translateService.instant("Constellations"),
      image: "/assets/images/subject-types/constellation-white.png?v=1"
    },
    {
      type: SmartFolderType.NO_DATA,
      name: this.translateService.instant("Lacking data"),
      icon: "frown",
      onlyOwner: true
    }
  ];

  protected activeFolderType: SmartFolderType;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this._setActiveFolderTypeFromRoute();
      this.changeDetectorRef.markForCheck();
    });

    this._setActiveFolderTypeFromRoute();
  }

  private _setActiveFolderTypeFromRoute(): void {
    this.activeFolderType = this.activatedRoute.snapshot.queryParamMap.get("folder-type") as SmartFolderType;
  }
}
