import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { env } from '../../shared/config/env';
import { ExternalApiError } from '../../shared/errors/AppError';
import { logger } from '../../shared/logger/logger';

export interface NBAResultSet {
  name: string;
  headers: string[];
  rowSet: (string | number | null)[][];
}

export interface NBAStatsResponse {
  resource: string;
  resultSets: NBAResultSet[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function zipRow(headers: string[], row: (string | number | null)[]): Record<string, string | number | null> {
  const result: Record<string, string | number | null> = {};
  headers.forEach((h, i) => {
    result[h] = row[i] ?? null;
  });
  return result;
}

export class NBAStatsHttpClient {
  private readonly client: AxiosInstance;
  private lastRequestAt = 0;

  constructor() {
    this.client = axios.create({
      baseURL: env.nbaStatsBaseUrl,
      timeout: 30_000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://stats.nba.com/',
        'Origin': 'https://www.nba.com',
        'x-nba-stats-origin': 'stats',
        'x-nba-stats-token': 'true',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Host': 'stats.nba.com',
      },
    });
  }

  async get(path: string, params: Record<string, string | number | boolean>): Promise<NBAStatsResponse> {
    await this.throttle();
    try {
      logger.debug(`NBA Stats API GET ${path} | params: ${JSON.stringify(params)}`);
      const config: AxiosRequestConfig = { params };
      const { data } = await this.client.get<NBAStatsResponse>(path, config);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`NBA Stats API error: ${msg}`);
      throw new ExternalApiError('NBA Stats API', msg);
    }
  }

  private async throttle(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestAt;
    if (elapsed < env.nbaRequestDelayMs) {
      await sleep(env.nbaRequestDelayMs - elapsed);
    }
    this.lastRequestAt = Date.now();
  }
}
