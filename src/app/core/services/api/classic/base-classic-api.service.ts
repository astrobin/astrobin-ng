import { environment } from "@env/environment";
import { BaseService } from "@core/services/base.service";

export class BaseClassicApiService extends BaseService {
  protected baseUrl = environment.classicApiUrl + "/api/v2";
}
