import { Injectable } from "@angular/core";
import { UserProfileModel } from "../models/common/userprofile.model";
import { environment } from "../../../environments/environment";

const BASE_URL = environment.legacyBaseUrl;

@Injectable({
  providedIn: "root",
})
export class LegacyRoutesService {
  HOME = BASE_URL + "/";
  LOGIN = BASE_URL + "/accounts/login/";
  REGISTER = BASE_URL + "/accounts/register/";
  SUBSCRIPTIONS = BASE_URL + "/subscriptions/";
  UPLOAD = BASE_URL + "/upload/";
  RAWDATA = BASE_URL + "/rawdata/";
  RAWDATA_PRIVATE_SHARED_FOLDERS = BASE_URL + "/rawdata/privatesharedfolders/";
  RAWDATA_PUBLIC_DATA_POOLS = BASE_URL + "/rawdata/publicdatapools/";
  RAWDATA_HELP = BASE_URL + "/rawdata/help/1/";
  INBOX = BASE_URL + "/messages/inbox/";
  SETTINGS = BASE_URL + "/profile/edit/basic/";
  LOGOUT = BASE_URL + "/accounts/logout/";
  FORUM_HOME = BASE_URL + "/forum/";
  FORUM_LATEST = BASE_URL + "/forum/topic/latest/";
  FORUM_SUBSCRIBED = BASE_URL + "/forum/topic/subscribed";
  SEARCH = BASE_URL + "/search/";
  TOP_PICKS = BASE_URL + "/explore/top-picks/";
  IOTD = BASE_URL + "/iotd/archive/";
  GROUPS = BASE_URL + "/groups/";
  TRENDING_ASTROPHOTOGRAPHERS = BASE_URL + "/trending-astrophotographers/";
  HELP = BASE_URL + "/help/";
  FAQ = BASE_URL + "/faq/";
  HELP_API = BASE_URL + "/help/api/";
  CONTACT = BASE_URL + "/contact/";
  MODERATE_IMAGE_QUEUE = BASE_URL + "/moderate/images/";
  MODERATE_SPAM_QUEUE = BASE_URL + "/moderate/spam/";
  IOTD_SUBMISSION_QUEUE = BASE_URL + "/iotd/submission-queue/";
  IOTD_REVIEW_QUEUE = BASE_URL + "/iotd/review-queue/";
  IOTD_JUDGEMENT_QUEUE = BASE_URL + "/iotd/judgement-queue/";

  COMMERCIAL_PRODUCTS = (profile: UserProfileModel) => BASE_URL + `/users/${profile.userObject.username}/commercial/products/`;

  GALLERY = (profile: UserProfileModel) => BASE_URL + `/users/${profile.userObject.username}/`;

  BOOKMARKS = (profile: UserProfileModel) => BASE_URL + `/users/${profile.userObject.username}/bookmarks/`;

  PLOTS = (profile: UserProfileModel) => BASE_URL + `/users/${profile.userObject.username}/plots/`;

  API_KEYS = (profile: UserProfileModel) => BASE_URL + `/users/${profile.userObject.username}/apikeys/`;

  SET_LANGUAGE = (languageCode: string) => BASE_URL + `/language/set/${languageCode}/`;
}
