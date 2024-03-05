import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
  });

  app.use(cookieParser())

  // app.use(
  //   session({
  //     secret: process.env.SESSION_SECRET,
  //     saveUninitialized: false,
  //     resave: false,
  //     cookie: {
  //       httpOnly: true,
  //       maxAge: 120 * 1000,
  //     },
  //   }),
  // );
  // app.use(passport.initialize)
  // app.use(passport.session())

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
  await app.listen(2021);
}
bootstrap();
