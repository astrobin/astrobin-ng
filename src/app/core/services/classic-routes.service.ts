import { Injectable } from "@angular/core";
import type { GroupInterface } from "@core/interfaces/group.interface";
import type { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import { BaseService } from "@core/services/base.service";
import { environment } from "@env/environment";

const BASE_URL = environment.classicBaseUrl;

@Injectable({
  providedIn: "root"
})
export class ClassicRoutesService extends BaseService {
  HOME = BASE_URL + "/";
  REGISTER = BASE_URL + "/accounts/register/";
  LOGIN = BASE_URL + "/accounts/login/";
  LOGOUT = BASE_URL + "/accounts/logout/";
  RESET_PASSWORD = BASE_URL + "/accounts/password/reset";
  PRICING = "https://welcome.astrobin.com/pricing";
  UPLOAD = BASE_URL + "/upload/";
  INBOX = BASE_URL + "/messages/inbox/";
  SETTINGS = BASE_URL + "/profile/edit/basic/";
  SETTINGS_PREFERENCES = BASE_URL + "/profile/edit/preferences/";
  SETTINGS_AVATAR = BASE_URL + "/avatar/change/";
  FORUM_HOME = BASE_URL + "/forum/";
  FORUM_LATEST = BASE_URL + "/forum/topic/latest/";
  FORUM_SUBSCRIBED = BASE_URL + "/forum/topic/subscribed";
  SEARCH = BASE_URL + "/search/";
  TOP_PICK_NOMINATIONS = BASE_URL + "/explore/top-pick-nominations/";
  TOP_PICKS = BASE_URL + "/explore/top-picks/";
  IOTD = BASE_URL + "/iotd/archive/";
  GROUPS = BASE_URL + "/groups/";
  REMOTE_ASTROPHOTOGRAPHY = "https://welcome.astrobin.com/remote-astrophotography";
  ASTROPHOTOGRAPHERS_LIST = BASE_URL + "/astrophotographers-list/";
  CONTRIBUTORS_LIST = BASE_URL + "/contributors-list/";
  ABOUT = "https://welcome.astrobin.com/about";
  FAQ = "https://welcome.astrobin.com/faq";
  HELP_API = "https://welcome.astrobin.com/application-programming-interface";
  SPONSORS = "https://welcome.astrobin.com/sponsors-and-partners";
  CONTACT = "https://welcome.astrobin.com/contact";
  MODERATE_IMAGE_QUEUE = BASE_URL + "/moderate/images/";
  MODERATE_SPAM_QUEUE = BASE_URL + "/moderate/images/spam/";
  MARKETPLACE_TERMS = "https://welcome.astrobin.com/marketplace-terms-of-service";
  REPORT_MARKETPLACE_LISTING_FROM = "https://welcome.astrobin.com/forms/marketplace-listing-report-form";

  SEND_MESSAGE = (username: UserInterface["username"]) => BASE_URL + "/messages/compose/" + username + "/";

  FORUM = (id: number) => BASE_URL + `/forum/forum/${id}/`;

  FORUM_POST = (id: string) => BASE_URL + `/forum/post/${id}/`;

  GROUP = (id: GroupInterface["id"]) => BASE_URL + `/groups/${id}/`;

  COMMERCIAL_PRODUCTS = (user: UserInterface) => BASE_URL + `/users/${user?.username}/commercial/products/`;

  GALLERY = (username: UserInterface["username"]) => BASE_URL + `/users/${username}/`;

  STAGING_GALLERY = (username: UserInterface["username"]) => BASE_URL + `/users/${username}/?staging`;

  BOOKMARKS = (user: UserInterface) => BASE_URL + `/users/${user?.username}/bookmarks/`;

  PLOTS = (user: UserInterface) => BASE_URL + `/users/${user?.username}/plots/`;

  API_KEYS = (user: UserInterface) => BASE_URL + `/users/${user?.username}/apikeys/`;

  SET_LANGUAGE = (languageCode: string, next) => BASE_URL + `/language/set/${languageCode}/?next=${next}`;

  IMAGE = (id: ImageInterface["hash"] | ImageInterface["pk"]) => BASE_URL + `/${id}/`;

  IMAGE_REVISION = (
    imageId: ImageInterface["hash"] | ImageInterface["pk"],
    revisionLabel: ImageRevisionInterface["label"]
  ) => BASE_URL + `/${imageId}/${revisionLabel}`;

  EDIT_IMAGE_THUMBNAILS = (id: string) => BASE_URL + `/edit/thumbnails/${id}/`;

  EDIT_IMAGE_GEAR = (id: string) => BASE_URL + `/edit/gear/${id}/`;

  EDIT_IMAGE_ACQUISITION = (id: string) => BASE_URL + `/edit/acquisition/${id}/`;

  EDIT_IMAGE_REVISION = (id: string) => BASE_URL + `/edit/revision/${id}/`;

  COMPOSE_MESSAGE = (username: string, subject: string) =>
    BASE_URL + `/messages/compose/${username}/?subject=${subject}`;
}
