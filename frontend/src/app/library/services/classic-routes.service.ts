import { Injectable } from "@angular/core";
import { UserProfileModel } from "@lib/models/common/userprofile.model";
import { environment } from "@env/environment";

const BASE_URL = environment.classicBaseUrl;

@Injectable({
  providedIn: "root",
})
export class ClassicRoutesService {
  HOME = BASE_URL + "/";
  REGISTER = BASE_URL + "/accounts/register/";
  SUBSCRIPTIONS = BASE_URL + "/subscriptions/";
  UPLOAD = BASE_URL + "/upload/";
  INBOX = BASE_URL + "/messages/inbox/";
  SETTINGS = BASE_URL + "/profile/edit/basic/";
  FORUM_HOME = BASE_URL + "/forum/";
  FORUM_LATEST = BASE_URL + "/forum/topic/latest/";
  FORUM_SUBSCRIBED = BASE_URL + "/forum/topic/subscribed";
  SEARCH = BASE_URL + "/search/";
  TOP_PICKS = BASE_URL + "/explore/top-picks/";
  IOTD = BASE_URL + "/iotd/archive/";
  GROUPS = BASE_URL + "/groups/";
  TRENDING_ASTROPHOTOGRAPHERS = BASE_URL + "/trending-astrophotographers/";
  ABOUT = "https://welcome.astrobin.com/about";
  FAQ = "https://welcome.astrobin.com/faq";
  HELP_API = BASE_URL + "/help/api/";
  SPONSORS = "https://welcome.astrobin.com/sponsors";
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
