import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { InfluxService } from './influx.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly influxService: InfluxService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('latest')
  async getLatestBpm() {
    return await this.influxService.getLatestBpm();
  }
}
