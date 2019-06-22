import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const options = new DocumentBuilder()
        .setTitle("AstroBin Certified Equipment API")
        .setDescription("The AstroBin Certified Equipment API description")
        .setVersion("0.1")
        .addTag("astrobin-certified-equipment")
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup("api", app, document);

    await app.listen(3000);
}

bootstrap();
