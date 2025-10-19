import { Module } from '@nestjs/common';
import { DataController } from './data/data.controller';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [DataController],
  providers: [PrismaService],
})
export class AppModule {}
