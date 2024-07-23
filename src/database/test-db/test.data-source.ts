// import { ConfigService } from "@nestjs/config";
// import { DataSource, DataSourceOptions } from "typeorm";
// import * as dotenv from 'dotenv'
// import { join } from "path";
// import { UserSignup } from "../../entities/signUp.details";
// import { QuizEntity } from "../../entities/quiz.entity";


// dotenv.config()
// const configService = new ConfigService();

// // const entitiesPath =
// //   process.env.NODE_ENV === 'production'
// //     ? 'dist/**/*.entity.js'
// //     : 'src/**/*.entity.ts';


// export const dataSourceOptions: DataSourceOptions = {
//   type: 'postgres',
//   host: '127.0.0.1',
//   port: 5432,
//   username: 'postgres',
//   password: '24680',
//   database: 'test-engine-testDb',
//   entities: [UserSignup, QuizEntity], //join(__dirname, '/../**/*.entity.{js,ts}')
//   synchronize: true,
//   // migrations: [join(__dirname, 'migrations/**/*{.ts,.js}')],
// };

// const dataSource = new DataSource(dataSourceOptions);

// export default dataSource;