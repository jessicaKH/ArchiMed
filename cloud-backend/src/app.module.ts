import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { DataService } from './data/data.service';
import { DataController } from './data/data.controller';

@Module({
  imports: [],
  providers: [PrismaService, DataService],
  controllers: [DataController]
})
export class AppModule {}
