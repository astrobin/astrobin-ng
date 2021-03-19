import { Component } from "@angular/core";
import { State } from "@app/store/state";
import { Logout } from "@features/account/store/auth.actions";
import { NotificationsService } from "@features/notifications/services/notifications.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { LoginModalComponent } from "@shared/components/auth/login-modal/login-modal.component";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { AuthService } from "@shared/services/auth.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";

interface AvailableLanguageInterface {
  code: string;
  label: string;
}

@Component({
  selector: "astrobin-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent extends BaseComponentDirective {
  isCollapsed = true;

  languages: AvailableLanguageInterface[] = [
    { code: "en", label: "English (US)" },
    { code: "en-GB", label: "English (UK)" },
    { code: "-", label: "-" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "it", label: "Italiano" },
    { code: "pt", label: "Português" },
    { code: "zh-hans", label: "中文 (简体)" },
    { code: "-", label: "-" },
    { code: "ar", label: "العربية" },
    { code: "el", label: "Ελληνικά" },
    { code: "fi", label: "Suomi" },
    { code: "ja", label: "日本語" },
    { code: "nl", label: "Nederlands" },
    { code: "pl", label: "Polski" },
    { code: "ru", label: "Русский" },
    { code: "sq", label: "Shqipe" },
    { code: "tr", label: "Türkçe" }
  ];

  languageCodeDisplays: AvailableLanguageInterface[] = [
    { code: "en", label: "EN" },
    { code: "en-GB", label: "EN (GB)" },
    { code: "de", label: "DE" },
    { code: "es", label: "ES" },
    { code: "fr", label: "FR" },
    { code: "it", label: "IT" },
    { code: "pt", label: "PT" },
    { code: "zh-hans", label: "ZH (CN)" },
    { code: "ar", label: "AR" },
    { code: "el", label: "EL" },
    { code: "fi", label: "FI" },
    { code: "ja", label: "JA" },
    { code: "nl", label: "NL" },
    { code: "pl", label: "PL" },
    { code: "ru", label: "RU" },
    { code: "sq", label: "SQ" },
    { code: "tr", label: "TR" }
  ];

  constructor(
    public modalService: NgbModal,
    public classicRoutes: ClassicRoutesService,
    public authService: AuthService,
    public notificationsService: NotificationsService,
    public loadingService: LoadingService,
    public windowRef: WindowRefService,
    public store: Store<State>,
    public translateService: TranslateService
  ) {
    super();
  }

  get currentLanguageCodeDisplay(): string {
    let display = this.languageCodeDisplays.filter(item => item.code === this.translateService.currentLang || "en");
    if (!display) {
      display = this.languageCodeDisplays.filter(item => item.code === "en");
    }

    return display[0].label;
  }

  getSetLanguageUrl(languageCode: string): string {
    if (languageCode === "zh_Hans") {
      languageCode = "zh-hans";
    }

    return this.classicRoutes.SET_LANGUAGE(languageCode, this.windowRef.nativeWindow.location.href);
  }

  openLoginModal($event) {
    $event.preventDefault();
    this.modalService.open(LoginModalComponent, { centered: true });
  }

  logout($event) {
    $event.preventDefault();
    this.store.dispatch(new Logout());
  }
}
