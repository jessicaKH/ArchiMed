import { Controller, Post, Body, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import fetch from 'node-fetch';

@Controller()
export class DataController {
  constructor(private prisma: PrismaService) {}

  @Post('data')
  async receiveData(@Body() body: { bpm: number }) {
    const bpm = body.bpm;
    console.log(`[Cloud] Received BPM: ${bpm}`);

    await this.prisma.bpmData.create({ data: { bpm } });

    if (bpm > 150) {
      console.log('[Cloud] ⚠️ CRISE DÉTECTÉE !');
      const payload = {
        numbers: ['+33612345678', '+33798765432'],
        message: `Alerte BPM=${bpm}`,
      };
      await fetch('http://sms-mock:7000/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

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