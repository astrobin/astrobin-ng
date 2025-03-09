import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnInit } from "@angular/core";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ScrollHideService } from "@core/services/scroll-hide.service";
import { UserService } from "@core/services/user.service";
import { UserInterface } from "@core/interfaces/user.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-mobile-footer",
  templateUrl: "./mobile-footer.component.html",
  styleUrls: ["./mobile-footer.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileFooterComponent extends BaseComponentDirective implements OnInit {
  @HostBinding('class.footer-hidden') isFooterHidden = false;
  user: UserInterface;
  userProfile: UserProfileInterface;

  constructor(
    public readonly store$: Store<MainState>,
    private readonly scrollHideService: ScrollHideService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    public readonly userService: UserService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    // Subscribe to footer visibility changes from the service
    this.scrollHideService.getFooterVisibility()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(isHidden => {
        this.isFooterHidden = isHidden;
        this.changeDetectorRef.markForCheck();
      });
      
    // Get current user data
    this.currentUserWrapper$.pipe(takeUntil(this.destroyed$)).subscribe(wrapper => {
      this.user = wrapper.user;
      this.userProfile = wrapper.userProfile;
      this.changeDetectorRef.markForCheck();
    });
  }
  
  openUserGallery(): void {
    if (this.user) {
      this.userService.openGallery(this.user.username, this.userProfile?.enableNewGalleryExperience);
    }
  }
}