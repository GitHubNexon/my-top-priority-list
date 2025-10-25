import { Module } from '@nestjs/common';

import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [UsersModule, HealthModule],
  exports: [UsersModule, HealthModule],
})
export class ModulesModule {}
