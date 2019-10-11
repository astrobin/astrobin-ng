import { environment } from "@env/environment";

export class BaseNgApiService {
  protected baseUrl = environment.ngApiUrl;
}
