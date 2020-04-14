import { Component } from "@angular/core";
import { LoginModalComponent } from "@lib/components/auth/login-modal/login-modal.component";
import { AppContextInterface, AppContextService } from "@lib/services/app-context.service";
import { AuthService } from "@lib/services/auth.service";
import { ClassicRoutesService } from "@lib/services/classic-routes.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs";

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
export class HeaderComponent {
  public isCollapsed = true;

  public appContext$: Observable<AppContextInterface>;

  public flags: FlagInterface[] = [
    { languageCode: "en", countryCode: "us", label: "English (US)" },
    { languageCode: "en-GB", countryCode: "gb", label: "English (UK)" },
    { languageCode: "it", countryCode: "it", label: "Italiano" },
    { languageCode: "es", countryCode: "es", label: "Español" },
    { languageCode: "fr", countryCode: "fr", label: "Français" },
    { languageCode: "fi", countryCode: "fi", label: "Suomi" },
    { languageCode: "de", countryCode: "de", label: "Deutsch" },
    { languageCode: "nl", countryCode: "nl", label: "Nederlands" },
    { languageCode: "tr", countryCode: "tr", label: "Türk" },
    { languageCode: "sq", countryCode: "al", label: "Shqipe" },
    { languageCode: "pl", countryCode: "pl", label: "Polski" },
    { languageCode: "pt-BR", countryCode: "br", label: "Português brasileiro" },
    { languageCode: "el", countryCode: "gr", label: "Ελληνικά" },
    { languageCode: "ru", countryCode: "ru", label: "Русский" },
    { languageCode: "ar", countryCode: "ar", label: "العربية" },
    { languageCode: "ja", countryCode: "jp", label: "日本語" }
  ];

  public constructor(
    appContext: AppContextService,
    public readonly modalService: NgbModal,
    public readonly classicRoutes: ClassicRoutesService,
    public readonly authService: AuthService
  ) {
    this.appContext$ = appContext.get();
  }

  public openLoginModal($event) {
    $event.preventDefault();
    this.modalService.open(LoginModalComponent, { centered: true });
  }

  public logout($event) {
    $event.preventDefault();
    this.authService.logout();
  }
}
