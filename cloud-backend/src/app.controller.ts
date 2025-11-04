import {Controller, Get, Post, Body} from '@nestjs/common';
import { AppService } from './app.service';
import {DataService} from "./data/data.service";
import { TachicardieDto } from './data/tachicardie.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private dataService: DataService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("/tachycardie")
  async postTachicardie(@Body() body: TachicardieDto){
    return await this.dataService.handleTachicardia(body);
  }
}
