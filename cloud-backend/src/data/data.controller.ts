import { Controller, Post, Body, Get } from '@nestjs/common';
import { DataService } from './data.service';

@Controller()
export class DataController {
  constructor(private dataService: DataService) {}

  @Get('api/latest')
  async latest() {
    return this.dataService.getConsumerBpmData();
  }
}