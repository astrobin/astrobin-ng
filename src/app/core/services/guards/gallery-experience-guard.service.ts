import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import type { Renderer2, RendererFactory2 } from "@angular/core";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import type { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { AuthService } from "@core/services/auth.service";
import type { UtilsService } from "@core/services/utils/utils.service";
import { environment } from "@env/environment";
import { AuthActionTypes } from "@features/account/store/auth.actions";
import { selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import type { Actions } from "@ngrx/effects";
import { ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { Observable } from "rxjs";
import { of } from "rxjs";
import { catchError, filter, map, switchMap, take, timeout } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class GalleryExperienceGuard implements CanActivate {
  private readonly isBrowser: boolean;
  private renderer: Renderer2;

  constructor(
    private readonly store$: Store<MainState>,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
    private readonly utilsService: UtilsService,
    private readonly actions$: Actions,
    private readonly authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (!this.isBrowser) {
      return of(true); // Let server-side rendering proceed
    }

    // Check if the route has data configuration for the guard
    const guardData = route.data?.galleryExperienceGuard;

    // For views like IOTD/TP Archive that only redirect with image param
    if (guardData?.redirectOnlyWithImageParam === true && !route.queryParams.i) {
      // If there's no 'i' param, and the route is configured to only redirect with an image param,
      // we can immediately allow access without checking the user profile
      return of(true);
    }

    // First check if user is authenticated at all
    const isAuthenticated = this.authService.getClassicApiToken() !== undefined;

    // If not authenticated, we can safely proceed with the new gallery experience
    if (!isAuthenticated) {
      return of(true);
    }

    // Check if user profile exists in store
    return this.store$.select(selectCurrentUserProfile).pipe(
      take(1),
      switchMap(userProfile => {
        // If we already have the user profile, make the decision now
        if (userProfile !== null && userProfile !== undefined) {
          return this.handleUserProfile(userProfile, route);
        }

        // If we don't have the user profile but the user is authenticated,
        // wait for the INITIALIZE_SUCCESS action which will populate the store
        return this.actions$.pipe(
          ofType(AuthActionTypes.INITIALIZE_SUCCESS),
          take(1),
          // Once initialization is complete, get the profile again
          switchMap(() =>
            this.store$.select(selectCurrentUserProfile).pipe(
              filter(profile => profile !== null && profile !== undefined),
              take(1),
              // Make the decision with the now-loaded profile
              switchMap(profile => this.handleUserProfile(profile, route))
            )
          ),
          // Add a timeout to avoid hanging indefinitely
          timeout(5000),
          // If timeout occurs, default to allowing access
          catchError(() => of(true))
        );
      })
    );
  }

  /**
   * Handles the user profile redirection logic
   * @param userProfile The user profile
   * @param route The activated route snapshot
   * @returns Observable<boolean> - true to proceed with routing, false to prevent
   */
  private handleUserProfile(userProfile: any, route: ActivatedRouteSnapshot): Observable<boolean> {
    // If the user doesn't have the flag enabled, redirect to classic site
    if (userProfile && userProfile.enableNewGalleryExperience === false) {
      // Show overlay immediately before further processing
      this.showLoadingOverlay();

      // Create an appropriate redirect URL based on the route
      let redirectUrl = environment.classicBaseUrl;

      // Helper function to handle image and revision parameters
      const appendImageAndRevisionToUrl = (imageId: string): string => {
        let url = "/" + imageId + "/";

        // Include revision if specified
        if (route.queryParams.r) {
          url += route.queryParams.r + "/";
        }

        return url;
      };

      // For image routes: /:imageId/
      if (route.params.imageId) {
        redirectUrl += appendImageAndRevisionToUrl(route.params.imageId);
      }
      // For user gallery routes with image param: redirect to image instead
      else if (route.params.username && route.queryParams.i) {
        // If gallery has image param, redirect to that image instead
        redirectUrl += appendImageAndRevisionToUrl(route.queryParams.i);
      }
      // For user gallery routes: /users/:username/
      else if (route.params.username) {
        redirectUrl += "/users/" + route.params.username + "/";
      }
      // For home page with image param: redirect to image instead
      else if (route.queryParams.i) {
        // If home page has image param, redirect to that image
        redirectUrl += appendImageAndRevisionToUrl(route.queryParams.i);
      }

      // Redirect with a tiny delay to ensure overlay is rendered
      this.utilsService.delay(10).subscribe(() => {
        window.location.href = redirectUrl;
      });

      // Return false observable to prevent any further Angular routing
      return of(false);
    }

    // User can access the new gallery experience, proceed with route
    return of(true);
  }

  /**
   * Shows a full-page loading overlay to prevent seeing partial content while redirecting
   */
  private showLoadingOverlay(): void {
    // Create overlay element
    const overlay = this.renderer.createElement("div");

    // Set styles for overlay
    this.renderer.setStyle(overlay, "position", "fixed");
    this.renderer.setStyle(overlay, "top", "0");
    this.renderer.setStyle(overlay, "left", "0");
    this.renderer.setStyle(overlay, "width", "100%");
    this.renderer.setStyle(overlay, "height", "100%");
    this.renderer.setStyle(overlay, "background-color", "#000");
    this.renderer.setStyle(overlay, "z-index", "9999");
    this.renderer.setStyle(overlay, "display", "flex");
    this.renderer.setStyle(overlay, "align-items", "center");
    this.renderer.setStyle(overlay, "justify-content", "center");
    this.renderer.setStyle(overlay, "opacity", "1");

    // Create spinner element
    const spinner = this.renderer.createElement("div");
    this.renderer.setStyle(spinner, "border", "5px solid #262626");
    this.renderer.setStyle(spinner, "border-top", "5px solid #3d5dce");
    this.renderer.setStyle(spinner, "border-radius", "50%");
    this.renderer.setStyle(spinner, "width", "50px");
    this.renderer.setStyle(spinner, "height", "50px");

    // Add animation style
    const styleElement = this.renderer.createElement("style");
    const animation = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    this.renderer.appendChild(styleElement, this.renderer.createText(animation));
    this.renderer.appendChild(this.document.head, styleElement);

    // Apply animation to spinner
    this.renderer.setStyle(spinner, "animation", "spin 1s linear infinite");

    // Add spinner to overlay and overlay to body
    this.renderer.appendChild(overlay, spinner);
    this.renderer.appendChild(this.document.body, overlay);
  }
}
