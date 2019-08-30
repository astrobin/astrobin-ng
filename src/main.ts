import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const options = new DocumentBuilder()
        .setTitle("AstroBin Microservice API")
        .setDescription("An API for AstroBin microservices")
        .setVersion("0.1.0")
        .addTag("astrobin-microservice-api")
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("api", app, document);

    await app.listen(process.env.PORT || 3000);
}

bootstrap();
