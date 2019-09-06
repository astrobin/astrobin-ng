import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as basicAuth from "express-basic-auth";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {cors: true});

    const options = new DocumentBuilder()
        .setTitle("AstroBin Microservice API")
        .setDescription("An API for AstroBin microservices")
        .setVersion("0.1.0")
        .addTag("astrobin-microservice-api")
        .build();
    const document = SwaggerModule.createDocument(app, options);
    const swaggerPath = "/docs";

    app.use(swaggerPath, basicAuth({
        challenge: true,
        users: {
            [process.env.DOCS_USER || "astrobin"]: process.env.DOCS_PASSWORD || "astrobin",
        },
    }));
    SwaggerModule.setup(swaggerPath, app, document);

    app.enableCors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: "Content-Type, Accept",
    });

    await app.listen(process.env.PORT || 3000);
}

bootstrap();
