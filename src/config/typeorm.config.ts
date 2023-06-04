import { ConfigModule, ConfigService } from '@nestjs/config';

export default class TypeOrmConfig {
  public static getOrmConfig(configService: ConfigService): any {
    return {
      type: configService.get('TYPEORM_CONNECTION'),
      host: configService.get('TYPEORM_HOST'),
      port: configService.get('TYPEORM_PORT'),
      username: configService.get('TYPEORM_USERNAME'),
      password: configService.get('TYPEORM_PASSWORD'),
      database: configService.get('TYPEORM_DATABASE'),
      entities: ['dist/**/*.entity.js'],
      synchronize: true,
      logging: false,
    };
  }
}

export const typeOrmConfigAsync: any = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService): Promise<any> =>
    TypeOrmConfig.getOrmConfig(configService),
  inject: [ConfigService],
};
