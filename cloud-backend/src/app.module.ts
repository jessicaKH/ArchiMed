import { Module } from '@nestjs/common';
import { DataService } from './data/data.service';
import {AppController} from "./app.controller";
import {AppService} from "./app.service";

@Module({
  imports: [],
  providers: [DataService, AppService],
  controllers: [AppController]
})
export class AppModule {}
