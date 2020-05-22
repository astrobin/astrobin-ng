import { Component } from "@angular/core";
import { NotificationsService } from "@features/notifications/services/notifications.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { LoginModalComponent } from "@shared/components/auth/login-modal/login-modal.component";
import { BaseComponent } from "@shared/components/base.component";
import { AppContextService } from "@shared/services/app-context.service";
import { AuthService } from "@shared/services/auth.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

interface FlagInterface {
  languageCode: string;
  countryCode: string;
  label: string;
}

@Component({
  selector: "astrobin-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent extends BaseComponent {
  isCollapsed = true;

  flags: FlagInterface[] = [
    { languageCode: "en", countryCode: "us", label: "English (US)" },
    { languageCode: "en-GB", countryCode: "gb", label: "English (UK)" },
    { languageCode: "-", countryCode: "-", label: "-" },
    { languageCode: "de", countryCode: "de", label: "Deutsch" },
    { languageCode: "es", countryCode: "es", label: "Español" },
    { languageCode: "fr", countryCode: "fr", label: "Français" },
    { languageCode: "it", countryCode: "it", label: "Italiano" },
    { languageCode: "-", countryCode: "-", label: "-" },
    { languageCode: "el", countryCode: "gr", label: "Ελληνικά" },
    { languageCode: "nl", countryCode: "nl", label: "Nederlands" },
    { languageCode: "pl", countryCode: "pl", label: "Polski" },
    { languageCode: "pt-BR", countryCode: "br", label: "Português brasileiro" },
    { languageCode: "ru", countryCode: "ru", label: "Русский" },
    { languageCode: "sq", countryCode: "al", label: "Shqipe" },
    { languageCode: "fi", countryCode: "fi", label: "Suomi" },
    { languageCode: "tr", countryCode: "tr", label: "Türk" },
    { languageCode: "ar", countryCode: "ar", label: "العربية" },
    { languageCode: "ja", countryCode: "jp", label: "日本語" }
  ];

  constructor(
    public appContext: AppContextService,
    public modalService: NgbModal,
    public classicRoutes: ClassicRoutesService,
    public authService: AuthService,
    public notificationsService: NotificationsService,
    public loadingService: LoadingService,
    public windowRef: WindowRefService
  ) {
    super();
  }

  openLoginModal($event) {
    $event.preventDefault();
    this.modalService.open(LoginModalComponent, { centered: true });
  }

  logout($event) {
    $event.preventDefault();
    this.authService.logout();
  }

  currentLanguageCode$(): Observable<string> {
    return this.appContext.context$.pipe(map(context => context.languageCode));
  }

  currentLanguageFlag$(): Observable<string> {
    return this.appContext.context$.pipe(
      map(context => {
        for (const flag of this.flags) {
          if (flag.languageCode === context.languageCode) {
            return flag.countryCode;
          }
        }
      })
    );
  }
}
