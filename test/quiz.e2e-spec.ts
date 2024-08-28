import { INestApplication } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RedisCacheModule } from "src/cache/cache.module";
import { Otp } from "src/entities/otp-entity";
import { QuizEntity } from "src/entities/quiz.entity";
import { QuizScore } from "src/entities/quiz.score";
import { UserSignup, TemporaryUserTable } from "src/entities/signUp.details";
import { MailModule } from "src/mail/mail.module";
import { MailService } from "src/mail/mail.service";
import { OtpService } from "src/otp/otp.service";
import { TemporaryUserModule } from "src/temporary-user/temporary-user.module";
import { UserModule } from "src/user/user.module";

describe('QuizController (e2e)', () => {
    let app: INestApplication;

    
    beforeAll(async () => {

        class MockMailerService {
          sendMail() {
            return Promise.resolve({ success: true });
          }
        }


        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
            }),
            TypeOrmModule.forRootAsync({
              imports: [ConfigModule],
              useFactory: async (configService: ConfigService) => ({
                type: 'postgres',
                host: '127.0.0.1',
                port: 5432,
                username: 'postgres',
                password: '24680',
                database: 'test-engine-testDb',
                entities: [
                  UserSignup,
                  QuizEntity,
                  QuizScore,
                  Otp,
                  TemporaryUserTable,
                ],
                // autoLoadEntities: true,
                synchronize: true,
              }),
              inject: [ConfigService],
            }),
            JwtModule.registerAsync({
              imports: [ConfigModule],
              useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET') || 'test-secret',
                signOptions: { expiresIn: '60s' },
              }),
              inject: [ConfigService],
            }),
            TypeOrmModule.forFeature([
              UserSignup,
              QuizScore,
              Otp,
              TemporaryUserTable,
            ]),
            TemporaryUserModule,
            UserModule,
            MailModule,
            RedisCacheModule,
          ],
          providers: [OtpService],
        })
          .overrideProvider(MailService)
          .useClass(MockMailerService)
          .compile();
        
        
    })
})