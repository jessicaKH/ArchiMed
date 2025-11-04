import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfluxService } from './influx.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, InfluxService],
})
export class AppModule {}
