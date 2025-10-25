import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { HashingService } from 'src/utils/services/hashing.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared.module';
@Module({
  imports: [   TypeOrmModule.forFeature([
      User,
    ]),
    SharedModule,
    // AuthModule,,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
