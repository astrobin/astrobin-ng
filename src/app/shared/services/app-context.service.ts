import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { LoadingService } from "@shared/services/loading.service";
import { UserStoreService } from "@shared/services/user-store.service";
import { TimeagoIntl } from "ngx-timeago";
import { BehaviorSubject, forkJoin, Observable, of } from "rxjs";
import { flatMap, share } from "rxjs/operators";
import { CommonApiService } from "./api/classic/common/common-api.service";

import { BaseService } from "@shared/services/base.service";
import { strings as timeagoAf } from "ngx-timeago/language-strings/af";
import { strings as timeagoAr } from "ngx-timeago/language-strings/ar";
import { strings as timeagoAz } from "ngx-timeago/language-strings/az";
import { strings as timeagoBg } from "ngx-timeago/language-strings/bg";
import { strings as timeagoBs } from "ngx-timeago/language-strings/bs";
import { strings as timeagoCa } from "ngx-timeago/language-strings/ca";
import { strings as timeagoCs } from "ngx-timeago/language-strings/cs";
import { strings as timeagoCy } from "ngx-timeago/language-strings/cy";
import { strings as timeagoDa } from "ngx-timeago/language-strings/da";
import { strings as timeagoDe } from "ngx-timeago/language-strings/de";
import { strings as timeagoDv } from "ngx-timeago/language-strings/dv";
import { strings as timeagoEl } from "ngx-timeago/language-strings/el";
import { strings as timeagoEn } from "ngx-timeago/language-strings/en";
import { strings as timeagoEs } from "ngx-timeago/language-strings/es";
import { strings as timeagoEt } from "ngx-timeago/language-strings/et";
import { strings as timeagoEu } from "ngx-timeago/language-strings/eu";
import { strings as timeagoFa } from "ngx-timeago/language-strings/fa";
import { strings as timeagoFi } from "ngx-timeago/language-strings/fi";
import { strings as timeagoFr } from "ngx-timeago/language-strings/fr";
import { strings as timeagoGl } from "ngx-timeago/language-strings/gl";
import { strings as timeagoHe } from "ngx-timeago/language-strings/he";
import { strings as timeagoHr } from "ngx-timeago/language-strings/hr";
import { strings as timeagoHu } from "ngx-timeago/language-strings/hu";
import { strings as timeagoHy } from "ngx-timeago/language-strings/hy";
import { strings as timeagoId } from "ngx-timeago/language-strings/id";
import { strings as timeagoIs } from "ngx-timeago/language-strings/is";
import { strings as timeagoIt } from "ngx-timeago/language-strings/it";
import { strings as timeagoJa } from "ngx-timeago/language-strings/ja";
import { strings as timeagoJv } from "ngx-timeago/language-strings/jv";
import { strings as timeagoKo } from "ngx-timeago/language-strings/ko";
import { strings as timeagoKy } from "ngx-timeago/language-strings/ky";
import { strings as timeagoLt } from "ngx-timeago/language-strings/lt";
import { strings as timeagoLv } from "ngx-timeago/language-strings/lv";
import { strings as timeagoMk } from "ngx-timeago/language-strings/mk";
import { strings as timeagoNl } from "ngx-timeago/language-strings/nl";
import { strings as timeagoNo } from "ngx-timeago/language-strings/no";
import { strings as timeagoPl } from "ngx-timeago/language-strings/pl";
import { strings as timeagoPt } from "ngx-timeago/language-strings/pt";
import { strings as timeagoPtBr } from "ngx-timeago/language-strings/pt-br";
import { strings as timeagoRo } from "ngx-timeago/language-strings/ro";
import { strings as timeagoRs } from "ngx-timeago/language-strings/rs";
import { strings as timeagoRu } from "ngx-timeago/language-strings/ru";
import { strings as timeagoRw } from "ngx-timeago/language-strings/rw";
import { strings as timeagoSi } from "ngx-timeago/language-strings/si";
import { strings as timeagoSk } from "ngx-timeago/language-strings/sk";
import { strings as timeagoSl } from "ngx-timeago/language-strings/sl";
import { strings as timeagoSr } from "ngx-timeago/language-strings/sr";
import { strings as timeagoSv } from "ngx-timeago/language-strings/sv";
import { strings as timeagoTh } from "ngx-timeago/language-strings/th";
import { strings as timeagoTr } from "ngx-timeago/language-strings/tr";
import { strings as timeagoUk } from "ngx-timeago/language-strings/uk";
import { strings as timeagoUz } from "ngx-timeago/language-strings/uz";
import { strings as timeagoVi } from "ngx-timeago/language-strings/vi";
import { strings as timeagoZhCn } from "ngx-timeago/language-strings/zh-CN";
import { strings as timeagoZhTw } from "ngx-timeago/language-strings/zh-TW";

export interface AppContextInterface {
  languageCode: string;
  currentUserProfile: UserProfileInterface;
  currentUser: UserInterface;
  currentUserSubscriptions: UserSubscriptionInterface[];
  subscriptions: SubscriptionInterface[];
}

@Injectable({
  providedIn: "root"
})
export class AppContextService extends BaseService {
  public context$: Observable<AppContextInterface>;

  private _subject = new BehaviorSubject<AppContextInterface>(undefined);
  private _appContext = {} as AppContextInterface;
  private _getCurrentUserProfile$ = this.commonApi.getCurrentUserProfile().pipe(share());
  private _getCurrentUser$ = this._getCurrentUserProfile$.pipe(
    flatMap(userProfile => {
      if (userProfile !== null) {
        return this.commonApi.getUser(userProfile.user);
      }

      return of(null);
    })
  );
  private _getUserSubscriptions$ = this._getCurrentUser$.pipe(
    flatMap(user => {
      if (user !== null) {
        return this.commonApi.getUserSubscriptions(user);
      }

      return of(null);
    })
  );
  private _getSubscriptions$ = this.commonApi.getSubscriptions().pipe(share());

  constructor(
    public loadingService: LoadingService,
    public commonApi: CommonApiService,
    public timeagoIntl: TimeagoIntl,
    public translate: TranslateService,
    public userStore: UserStoreService
  ) {
    super(loadingService);
    this.context$ = this._subject.asObservable();
  }

  load(): Promise<any> {
    return new Promise<any>(resolve => {
      forkJoin([this._getSubscriptions$]).subscribe(results => {
        this._appContext = {
          ...this._appContext,
          ...{
            subscriptions: results[0]
          }
        };

        let defaultLanguage = navigator.language || "en";
        if (defaultLanguage.indexOf("-") > -1) {
          defaultLanguage = defaultLanguage.split("-")[0];
        }

        this._appContext.languageCode = defaultLanguage;

        this.translate.setDefaultLang(defaultLanguage);
        this.translate.use(defaultLanguage).subscribe(() => {
          this._setTimeagoIntl(defaultLanguage);
          this._subject.next(this._appContext);
          resolve(this);
        });
      });
    });
  }

  loadForUser(): Promise<any> {
    return new Promise<any>(resolve => {
      forkJoin([this._getCurrentUserProfile$, this._getCurrentUser$, this._getUserSubscriptions$]).subscribe(
        results => {
          const userProfile = results[0];
          const user = results[1];

          this.userStore.addUserProfile(userProfile);
          this.userStore.addUser(user);

          this._appContext = {
            ...this._appContext,
            ...{
              currentUserProfile: userProfile,
              currentUser: user,
              currentUserSubscriptions: results[2]
            }
          };

          const languageCode = this._appContext.currentUserProfile.language;
          this._appContext.languageCode = languageCode;
          this.translate.setDefaultLang(languageCode);
          this.translate.use(languageCode).subscribe(() => {
            this._setTimeagoIntl(languageCode);
            this._subject.next(this._appContext);
            resolve(this);
          });
        }
      );
    });
  }

  private _setTimeagoIntl(language: string): void {
    switch (language) {
      case "af":
        this.timeagoIntl.strings = timeagoAf;
        break;
      case "ar":
        this.timeagoIntl.strings = timeagoAr;
        break;
      case "az":
        this.timeagoIntl.strings = timeagoAz;
        break;
      case "bg":
        this.timeagoIntl.strings = timeagoBg;
        break;
      case "bs":
        this.timeagoIntl.strings = timeagoBs;
        break;
      case "ca":
        this.timeagoIntl.strings = timeagoCa;
        break;
      case "cs":
        this.timeagoIntl.strings = timeagoCs;
        break;
      case "cy":
        this.timeagoIntl.strings = timeagoCy;
        break;
      case "da":
        this.timeagoIntl.strings = timeagoDa;
        break;
      case "de":
        this.timeagoIntl.strings = timeagoDe;
        break;
      case "dv":
        this.timeagoIntl.strings = timeagoDv;
        break;
      case "el":
        this.timeagoIntl.strings = timeagoEl;
        break;
      case "en":
        this.timeagoIntl.strings = timeagoEn;
        break;
      case "es":
        this.timeagoIntl.strings = timeagoEs;
        break;
      case "et":
        this.timeagoIntl.strings = timeagoEt;
        break;
      case "eu":
        this.timeagoIntl.strings = timeagoEu;
        break;
      case "fa":
        this.timeagoIntl.strings = timeagoFa;
        break;
      case "fi":
        this.timeagoIntl.strings = timeagoFi;
        break;
      case "fr":
        this.timeagoIntl.strings = timeagoFr;
        break;
      case "gl":
        this.timeagoIntl.strings = timeagoGl;
        break;
      case "he":
        this.timeagoIntl.strings = timeagoHe;
        break;
      case "hr":
        this.timeagoIntl.strings = timeagoHr;
        break;
      case "hu":
        this.timeagoIntl.strings = timeagoHu;
        break;
      case "hy":
        this.timeagoIntl.strings = timeagoHy;
        break;
      case "id":
        this.timeagoIntl.strings = timeagoId;
        break;
      case "is":
        this.timeagoIntl.strings = timeagoIs;
        break;
      case "it":
        this.timeagoIntl.strings = timeagoIt;
        break;
      case "ja":
        this.timeagoIntl.strings = timeagoJa;
        break;
      case "jv":
        this.timeagoIntl.strings = timeagoJv;
        break;
      case "ko":
        this.timeagoIntl.strings = timeagoKo;
        break;
      case "ky":
        this.timeagoIntl.strings = timeagoKy;
        break;
      case "lt":
        this.timeagoIntl.strings = timeagoLt;
        break;
      case "lv":
        this.timeagoIntl.strings = timeagoLv;
        break;
      case "mk":
        this.timeagoIntl.strings = timeagoMk;
        break;
      case "nl":
        this.timeagoIntl.strings = timeagoNl;
        break;
      case "no":
        this.timeagoIntl.strings = timeagoNo;
        break;
      case "pl":
        this.timeagoIntl.strings = timeagoPl;
        break;
      case "pt":
        this.timeagoIntl.strings = timeagoPt;
        break;
      case "pt-br":
        this.timeagoIntl.strings = timeagoPtBr;
        break;
      case "ro":
        this.timeagoIntl.strings = timeagoRo;
        break;
      case "rs":
        this.timeagoIntl.strings = timeagoRs;
        break;
      case "ru":
        this.timeagoIntl.strings = timeagoRu;
        break;
      case "rw":
        this.timeagoIntl.strings = timeagoRw;
        break;
      case "si":
        this.timeagoIntl.strings = timeagoSi;
        break;
      case "sk":
        this.timeagoIntl.strings = timeagoSk;
        break;
      case "sl":
        this.timeagoIntl.strings = timeagoSl;
        break;
      case "sr":
        this.timeagoIntl.strings = timeagoSr;
        break;
      case "sv":
        this.timeagoIntl.strings = timeagoSv;
        break;
      case "th":
        this.timeagoIntl.strings = timeagoTh;
        break;
      case "tr":
        this.timeagoIntl.strings = timeagoTr;
        break;
      case "uk":
        this.timeagoIntl.strings = timeagoUk;
        break;
      case "uz":
        this.timeagoIntl.strings = timeagoUz;
        break;
      case "vi":
        this.timeagoIntl.strings = timeagoVi;
        break;
      case "zh-CN":
        this.timeagoIntl.strings = timeagoZhCn;
        break;
      case "zh-TW":
        this.timeagoIntl.strings = timeagoZhTw;
        break;
      default:
        this.timeagoIntl.strings = timeagoEn;
    }

    this.timeagoIntl.changes.next();
  }
}
