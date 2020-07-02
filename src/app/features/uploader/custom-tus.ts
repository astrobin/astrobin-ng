import { Tus } from "ngx-uploadx";

export class CustomTus extends Tus {
  protected setAuth(token: string) {
    (this.headers as any).Authorization = `Token ${token}`;
  }
}
