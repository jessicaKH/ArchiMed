import { Injectable } from '@nestjs/common';
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';

@Injectable()
export class InfluxService {
  private influxDB: InfluxDB;
  private queryApi: QueryApi;
  private readonly url = 'http://influxdb:8086';
  private readonly token =
    '1tUJ8TUG91tkaMeFjIUVrgAfdXT1KrOXgJmI0cUncn9y3_NrHQhkaHRbSWlcblHLWHe5EBwmXpW77E-ZVitLXA==';
  private readonly org = 'archimed';
  private readonly bucket = 'health';

  constructor() {
    this.influxDB = new InfluxDB({ url: this.url, token: this.token });
    this.queryApi = this.influxDB.getQueryApi(this.org);
  }

  async getLatestBpm(): Promise<{ value: number; timestamp: string }[]> {
    const fluxQuery = `
      from(bucket: "${this.bucket}")
        |> range(start: -1d)
        |> filter(fn: (r) => r["_measurement"] == "bpm")
        |> filter(fn: (r) => r["patient"] == "patient-1")
        |> sort(columns: ["_time"], desc: true)
        |> limit(n: 50)
    `;
    const results: { value: number; timestamp: string }[] = [];
    return new Promise((resolve, reject) => {
      this.queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          results.push({ value: o._value, timestamp: o._time });
        },
        error(error) {
          reject(error);
        },
        complete() {
          resolve(results);
        },
      });
    });
  }
}

