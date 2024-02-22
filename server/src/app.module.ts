import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalModule } from './modules/global/global.module';
import { ConfigurationModule } from './modules/config/config.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [GlobalModule, ConfigurationModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
