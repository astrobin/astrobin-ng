import {
    BadRequestException,
    CallHandler,
    ExecutionContext,
    Injectable,
    InternalServerErrorException,
    NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle()
            .pipe(
                catchError(error => {
                    if (error.code && error.code.indexOf("CONSTRAINT") > -1) {
                        return throwError(new BadRequestException(error.message));
                    }

                    return throwError(new InternalServerErrorException());
                }),
            );
    }
}
