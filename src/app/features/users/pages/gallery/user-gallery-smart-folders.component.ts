import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { fadeInOut } from "@shared/animations";

export enum SmartFolderType {
  YEAR = "year",
  GEAR = "gear",
  SUBJECT = "subject",
  CONSTELLATION = "constellation"
}

@Component({
  selector: "astrobin-user-gallery-smart-folders",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div
        *ngIf="!activeFolderType"
        @fadeInOut
        class="d-flex flex-wrap gap-4 justify-content-center"
      >
        <a
          *ngFor="let smartFolder of smartFolders"
          [routerLink]="['/u', user.username]"
          [queryParams]="{ 'folder-type': smartFolder.type }"
          fragment="smart-folders"
          class="smart-folder-category"
        >
          <div class="smart-folder-background"></div>
          <div class="smart-folder-stars"></div>
          <div class="smart-folder" [routerLink]="['/u', user.username, 'gallery', 'smart', smartFolder.name]">
            <div class="icon">
              <fa-icon *ngIf="smartFolder.icon" [icon]="smartFolder.icon"></fa-icon>
              <img *ngIf="smartFolder.image" [src]="smartFolder.image" alt="" />
            </div>
            <div class="name">{{ smartFolder.name }}</div>
          </div>
        </a>
      </div>

      <astrobin-user-gallery-smart-folder
        *ngIf="activeFolderType"
        @fadeInOut
        (activeChange)="activeChange.emit($event)"
        [user]="user"
        [userProfile]="userProfile"
        [folderType]="activeFolderType"
      ></astrobin-user-gallery-smart-folder>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-smart-folders.component.scss"],
  animations: [fadeInOut]
})
export class UserGallerySmartFoldersComponent extends BaseComponentDirective implements OnInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  @Output() readonly activeChange = new EventEmitter<string>();

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
    }
  ];

  protected activeFolderType: SmartFolderType;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.pipe(takeUntil(this.destroyed$)).subscribe(params => {
      this.activeFolderType = params.get("folder-type") as SmartFolderType;
    });
  }
}
