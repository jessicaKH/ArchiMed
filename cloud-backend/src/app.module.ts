import { Module } from '@nestjs/common';
import { DataService } from './data/data.service';

@Module({
  imports: [],
  providers: [DataService],
  controllers: []
})
export class AppModule {}
