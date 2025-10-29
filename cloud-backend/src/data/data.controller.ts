import { Controller, Post, Body, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class DataController {
  constructor(private prisma: PrismaService) {}

  @Get('api/latest')
  async latest() {
    return this.prisma.bpmData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }
}