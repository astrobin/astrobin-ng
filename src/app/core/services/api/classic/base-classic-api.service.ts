import { BaseService } from "@core/services/base.service";
import { environment } from "@env/environment";

export class BaseClassicApiService extends BaseService {
  protected baseUrl = environment.classicApiUrl + "/api/v2";
}
