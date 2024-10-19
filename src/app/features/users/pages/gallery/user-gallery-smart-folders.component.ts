import { Component, Input, OnInit } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute } from "@angular/router";
import { takeUntil } from "rxjs/operators";

enum FolderType {
  YEARS = "years",
  EQUIPMENT = "equipment",
  SUBJECT_TYPES = "subject_types",
  CONSTELLATIONS = "constellations"
}

@Component({
  selector: "astrobin-user-gallery-smart-folders",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="d-flex flex-nowrap gap-4 justify-content-center">
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
    </ng-container>
  `,
  styleUrls: ["./user-gallery-smart-folders.component.scss"]
})
export class UserGallerySmartFoldersComponent extends BaseComponentDirective implements OnInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  public readonly smartFolders = [
    {
      type: FolderType.YEARS,
      name: this.translateService.instant("Years"),
      icon: "calendar"
    },
    {
      type: FolderType.EQUIPMENT,
      name: this.translateService.instant("Equipment"),
      icon: "camera"
    },
    {
      type: FolderType.SUBJECT_TYPES,
      name: this.translateService.instant("Subject types"),
      icon: "star"
    },
    {
      type: FolderType.CONSTELLATIONS,
      name: this.translateService.instant("Constellations"),
      image: "/assets/images/subject-types/constellation-white.png?v=1"
    }
  ];

  protected activeFolderType: FolderType;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.pipe(takeUntil(this.destroyed$)).subscribe(params => {
      this.activeFolderType = params.get("folder-type") as FolderType;
    });
  }
}
