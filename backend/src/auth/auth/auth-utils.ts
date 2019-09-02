import * as crypto from "crypto";

export class AuthUtils {
    public static hashPassword(password: string): string {
        return crypto.createHmac("sha256", password).digest("hex");
    }
}
