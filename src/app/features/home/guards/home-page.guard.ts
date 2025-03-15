import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { GalleryExperienceGuard } from "@core/services/guards/gallery-experience-guard.service";

@Injectable({
  providedIn: "root"
})
export class HomePageGuard implements CanActivate {
  constructor(private galleryExperienceGuard: GalleryExperienceGuard) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Delegate to the central gallery experience guard
    return this.galleryExperienceGuard.canActivate(route, state);
  }
}