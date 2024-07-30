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
import { LoginDto, SignupDto, UpdateUserDetailsDto } from '../src/user/dto/user-dto';
import { VerifyOtpDto } from '../src/otp/otpDto/otp-dto';
import { OtpService } from '../src/otp/otp.service';
import { UserModule } from '../src/user/user.module';
import { RedisCacheModule } from '../src/cache/cache.module';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserSignup>;
  let tempUserRepository: Repository<TemporaryUserTable>;
  let quizRepository: Repository<QuizEntity>;
  let otpRepository: Repository<Otp>;
  let jwtService: JwtService;
  let token: string
  

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
      signAsync(payload: any) {
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
        TypeOrmModule.forFeature([UserSignup, QuizScore, Otp, TemporaryUserTable]),
        TemporaryUserModule,
        UserModule,
        MailModule,
        RedisCacheModule
        // AppModule
      ],
      providers: [OtpService]
    })
      .overrideProvider(MailService)
      .useClass(MockMailerService)
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
     
      otpRepository = moduleFixture.get<Repository<Otp>>(getRepositoryToken(Otp))
      
    jwtService = moduleFixture.get<JwtService>(JwtService)
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
      
         const tempUserQueryRunner =
           tempUserRepository.manager.connection.createQueryRunner();
         await tempUserQueryRunner.query('TRUNCATE TABLE "temporary_user_table" CASCADE');
      
        //  const otpQueryRunner =
        //    otpRepository.manager.connection.createQueryRunner();
        //  await otpQueryRunner.query('TRUNCATE TABLE "otp" CASCADE');
      

        console.log('Database cleared successfully.');
      } catch (error) {
        console.error('Error clearing database:', error);
      }
    await app.close()
  })

  const userLogin: LoginDto = {
    email: 'testingmail@gmail.com',
    password: '1234',
  };
  
  const invalidLoginCredentials: LoginDto = {
    email: 'testmail@gmail.com',
    password: '1234'
  };

  const user: SignupDto = {
    email: 'testingmail@gmail.com',
    password: '1234',
    username: '@testi_user',
  };

  const otp: VerifyOtpDto = {
    code: 2024,
  };

//   it('should register user and send an otp, POST', async () => {
//     const user: SignupDto = {
//       email: 'testimail@gmail.com',
//       password: '1234',
//       username: '@testi_user',
//     };
//     const response = await request(app.getHttpServer())
//       .post('/signup')
//       .send(user)
//       .expect(201)
    
//       expect(response.body.message).toBe(
//         'An otp has been sent to testimail@gmail.com for verification',
//       );
//   });

   
  
  it('should throw a 400 Bad request when user enters invalid login credentials, POST', async () => {
    await request(app.getHttpServer())
      .post('/user/signin')
      .send(invalidLoginCredentials)
      .expect(400)

  }, 30000)

  it('should return all the users, GET', async () => {
    const user: SignupDto = {
      email: 'user@gmail.com',
      password: '1234',
      username: 'user',
      role: 'admin',
      secretKey: 'startHubDevs',
    };

    const signedUser: LoginDto = {
      email: 'user@gmail.com',
      password: '1234'
    }

    const updateUserDetails: UpdateUserDetailsDto = {
      firstName: 'User',
      lastName: 'Test',
      course: 'web developement',
      password: '1234'
    }

    await request(app.getHttpServer())
      .post('/signup')
      .send(user)
      .expect(201);
    
    await request(app.getHttpServer())
       .post('/otp/verify')
       .send(otp)
       .expect(200);
    
   const loginTest =  await request(app.getHttpServer())
      .post('/user/signin')
      .send(signedUser)
      .expect(200);
    
     const accessToken =  loginTest.body.jwtToken.access_token
    
  
    const users = await request(app.getHttpServer())
      .get('/user/allUsers')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
     
    const userId = users.body.data[0].id

     await request(app.getHttpServer())
      .get(`/user/fetchUser/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    
    const userDetails = await request(app.getHttpServer())
      .patch('/user/updateUserDetails')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateUserDetails)
      .expect(200);
    
    console.log(userDetails.body)

    
  }, 30000)


});