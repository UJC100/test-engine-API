import { ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import * as dotenv from 'dotenv'
import { join } from "path";


dotenv.config()
const configService = new ConfigService();

// const entitiesPath =
//   process.env.NODE_ENV === 'production'
//     ? 'dist/**/*.entity.js'
//     : 'src/**/*.entity.ts';


export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.getOrThrow('POSTGRES_HOST'),
  port: configService.getOrThrow('POSTGRES_PORT'),
  username: configService.getOrThrow('POSTGRES_USER'),
  password: configService.getOrThrow('POSTGRES_PASSWORD'),
  database: configService.getOrThrow('POSTGRES_DATABASE'),
  entities: [join(__dirname, '../src/entities/**/*{.ts,.js}')],
  synchronize: false,
  migrations: [join(__dirname, 'migrations/**/*{.ts,.js}')],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;