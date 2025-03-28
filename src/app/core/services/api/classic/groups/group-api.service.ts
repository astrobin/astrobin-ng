import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { GroupInterface } from "@core/interfaces/group.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@core/services/loading.service";
import { EMPTY, Observable } from "rxjs";
import { expand, reduce } from "rxjs/operators";
import { UserInterface } from "@core/interfaces/user.interface";
import { UtilsService } from "@core/services/utils/utils.service";

export interface GetGroupsParamsInterface {
  members?: UserInterface["id"];
  ids?: GroupInterface["id"][];
}

@Injectable({
  providedIn: "root"
})
export class GroupApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/groups/group/";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getAll(memberId?: UserInterface["id"]): Observable<GroupInterface[]> {
    const params: GetGroupsParamsInterface = {};

    if (memberId !== undefined) {
      params.members = memberId;
    }

    return this.fetchGroups(params);
  }

  getByIds(ids: GroupInterface["id"][]): Observable<GroupInterface[]> {
    if (ids.length === 0) {
      return EMPTY;
    }

    const params: GetGroupsParamsInterface = { ids: ids };

    return this.fetchGroups(params);
  }

  public fetchGroups(params: GetGroupsParamsInterface): Observable<GroupInterface[]> {
    let url = this.configUrl;

    // Use UtilsService.addOrUpdateUrlParam to build the URL with parameters
    if (params.members !== undefined) {
      url = UtilsService.addOrUpdateUrlParam(url, 'members', params.members.toString());
    }

    if (params.ids && params.ids.length > 0) {
      // Backend uses 'id' in singular.
      url = UtilsService.addOrUpdateUrlParam(url, 'id', params.ids.join(","));
    }

    return this.http.get<PaginatedApiResultInterface<GroupInterface>>(url).pipe(
      expand(response => (response.next ? this.http.get(response.next) : EMPTY)),
      reduce(
        (accumulator, response) =>
          accumulator.concat((response as PaginatedApiResultInterface<GroupInterface>).results),
        []
      )
    );
  }
}
