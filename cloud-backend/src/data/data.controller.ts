import { Controller, Post, Body, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class DataController {
  constructor(private prisma: PrismaService) {}

  @Post('data')
  async receiveData(@Body() body: { bpm: number }) {
    const bpm = body.bpm;
    console.log(`[Cloud] BPM reçu : ${bpm}`);

    await this.prisma.bpmData.create({ data: { bpm } });

    return { status: 'ok' };
  }

  @Get('api/latest')
  async latest() {
    return this.prisma.bpmData.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
  }
}