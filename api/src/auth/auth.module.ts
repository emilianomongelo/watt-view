import { Module } from '@nestjs/common';
import { ApiTokenGuard } from './auth.guard';

@Module({
  providers: [ApiTokenGuard],
  exports: [ApiTokenGuard],
})
export class AuthModule {}
