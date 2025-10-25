import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModulesModule } from './modules.module';
import { SharedModule } from './shared.module';
// import { UsersModule } from './modules/users/users.module';
import { JwtGlobalModule } from './jwt.module';

@Module({
  // imports: [UsersModule],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isSSL = configService.get<string>('DB_SSL') === 'true';

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
          database: configService.get<string>('DB_NAME'),
          schema: 'public',
          autoLoadEntities: true,
          synchronize: configService.get<string>('NODE_ENV') === 'development',
          ssl: isSSL ? { rejectUnauthorized: false } : false,
          extra: isSSL ? { sslmode: 'require' } : {},
        };
      },
    }),
    ModulesModule,
    SharedModule,
    JwtGlobalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
