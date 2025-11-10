import { apiGet } from '@apis/base_api';
import { LegoSet } from '@models/lego.model';
import { RebrickableResponse, RebrickableSet } from './models/rebrickable_response';

export interface BaseLegoApiImpl {
  getByQuery(query: string, options?: Record<string, string>): Promise<LegoSet[]>;
}

export class RebrickableApi implements BaseLegoApiImpl {
  private static readonly MAX_RESULTS = 40;
  private static readonly API_BASE_URL = 'https://rebrickable.com/api/v3/lego';

  constructor(private readonly apiKey: string) {}

  private buildSearchParams(query: string): Record<string, string | number> {
    return {
      search: query,
      page_size: RebrickableApi.MAX_RESULTS,
    };
  }

  async getByQuery(query: string, _options?: Record<string, string>): Promise<LegoSet[]> {
    try {
      const params = this.buildSearchParams(query);
      const headers = {
        Authorization: `key ${this.apiKey}`,
      };

      const searchResults = await apiGet<RebrickableResponse>(`${RebrickableApi.API_BASE_URL}/sets/`, params, headers);

      if (!searchResults?.count) return [];

      return searchResults.results.map(set => this.createLegoSetItem(set));
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }

  private createLegoSetItem(item: RebrickableSet): LegoSet {
    const legoSet: LegoSet = {
      set_num: item.set_num,
      name: item.name,
      year: item.year,
      theme_id: item.theme_id,
      num_parts: item.num_parts,
      set_img_url: item.set_img_url || undefined,
      set_url: item.set_url,
    };
    return legoSet;
  }
}
