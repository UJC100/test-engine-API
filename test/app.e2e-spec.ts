import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { join } from 'path';
import { TemporaryUserTable, UserSignup } from '../src/entities/signUp.details';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { TemporaryUserModule } from '../src/temporary-user/temporary-user.module';
import { MailService } from '../src/mail/mail.service';
import { MailModule } from '../src/mail/mail.module';
import { CacheService } from '../src/cache/cache.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { QuizScore } from '../src/entities/quiz.score';
import { QuizEntity } from '../src/entities/quiz.entity';
import { Otp } from '../src/entities/otp-entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserSignup>;
  let tempUserRepository: Repository<TemporaryUserTable>;
  let quizRepository: Repository<QuizEntity>

  beforeAll(async () => {

    class MockMailerService {
      sendMail() {
        return Promise.resolve({ success: true });
      }
    }

    class MockCacheService {
      get(key: string) {
        return Promise.resolve(null);
      }

      set(key: string, value: any) {
        return Promise.resolve(true);
      }
    }

    class MockJwtService {
      sign(payload: any) {
        // Return a fixed token for tests
        return 'mockJwtToken';
      }

      // verify(token: string) {
      //   // Return a decoded payload or throw an error if needed
      //   if (token === 'mockJwtToken') {
      //     return { userId: 1, username: 'test_user' }; // Example payload
      //   }
      //   throw new Error('Invalid token');
      // }
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
            entities: [UserSignup, QuizEntity, QuizScore, Otp, TemporaryUserTable],
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
        TypeOrmModule.forFeature([UserSignup, QuizScore]),
        TemporaryUserModule,
      ],
    })
      .overrideProvider(MailService)
      .useClass(MockMailerService)
      .overrideProvider(CacheService)
      .useClass(MockCacheService)
      .overrideProvider(JwtService)
      .useClass(MockJwtService)
      .compile();

    app = moduleFixture.createNestApplication(),
    app.useGlobalPipes(new ValidationPipe())
    await app.init();

      userRepository = moduleFixture.get<Repository<UserSignup>>(
        getRepositoryToken(UserSignup),
      );
      tempUserRepository = moduleFixture.get<Repository<TemporaryUserTable>>(
        getRepositoryToken(TemporaryUserTable),
      );
     
      
  });


  afterAll(async () => {
    let timerId: NodeJS.Timeout
    try {
      if (timerId) {
          clearTimeout(timerId)
        }
         const queryRunner =
           userRepository.manager.connection.createQueryRunner();
         await queryRunner.query('TRUNCATE TABLE "user_signup" CASCADE');
      
         const anotherQueryRunner =
           tempUserRepository.manager.connection.createQueryRunner();
         await anotherQueryRunner.query('TRUNCATE TABLE "temporary_user_table" CASCADE');
      

        console.log('Database cleared successfully.');
      } catch (error) {
        console.error('Error clearing database:', error);
      }
    await app.close()
  })

  it('should register user and send an otp, POST', async () => {
    const user = {
      email: 'testimail@gmail.com',
      password: '1234',
      username: '@testi_user',
    };
    const response = await request(app.getHttpServer())
      .post('/signup')
      .send(user)
      .expect(201)
    
      expect(response.body.message).toBe(
        'An otp has been sent to testimail@gmail.com for verification',
      );
  });
});
