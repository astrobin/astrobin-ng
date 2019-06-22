import {Injectable} from "@nestjs/common";

@Injectable()
export class VendorService {
    getHello(): string {
        return "Hello World!";
    }
}
