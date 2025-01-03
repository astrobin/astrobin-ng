import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";

@Component({
  selector: "astrobin-user-gallery-about",
  template: `
    <div class="about-section"
      *ngIf="userProfile.about || userProfile.job || userProfile.hobbies; else noAboutTemplate"
    >
      <div *ngIf="userProfile.about" class="about">
        <h5 translate="About"></h5>
        <p [innerHTML]="userProfile.about"></p>
      </div>

      <div *ngIf="userProfile.job" class="job">
        <h5 translate="Job"></h5>
        <p [innerHTML]="userProfile.job"></p>
      </div>

      <div *ngIf="userProfile.hobbies" class="hobbies">
        <h5 translate="Hobbies"></h5>
        <p [innerHTML]="userProfile.hobbies"></p>
      </div>
    </div>

    <ng-template #noAboutTemplate>
      <astrobin-nothing-here
        [withAlert]="false"
        [withInfoSign]="false"
      ></astrobin-nothing-here>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-about.component.scss"]
})
export class UserGalleryAboutComponent extends BaseComponentDirective implements OnInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;

  constructor(
    public readonly store$: Store<MainState>
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
