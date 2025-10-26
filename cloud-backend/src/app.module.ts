import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { DataService } from './data/data.service';

@Module({
  imports: [],
  providers: [PrismaService, DataService],
})
export class AppModule {}
