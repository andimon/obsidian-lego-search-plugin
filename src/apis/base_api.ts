import { LegoSet } from '@models/lego.model';
import { LegoSearchPluginSettings } from '@settings/settings';
import { ServiceProvider } from '@src/constants';
import { requestUrl } from 'obsidian';
import { RebrickableApi } from './rebrickable_api';

export interface BaseLegoApiImpl {
  getByQuery(query: string, options?: Record<string, string>): Promise<LegoSet[]>;
}

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function factoryServiceProvider(settings: LegoSearchPluginSettings): BaseLegoApiImpl {
  switch (settings.serviceProvider) {
    case ServiceProvider.rebrickable:
      validateRebrickableSettings(settings);
      return new RebrickableApi(settings.rebrickableApiKey);
    default:
      throw new Error('Unsupported service provider.');
  }
}

function validateRebrickableSettings(settings: LegoSearchPluginSettings): void {
  if (!settings.rebrickableApiKey) {
    throw new ConfigurationError('Please provide a Rebrickable API key. Get one free at https://rebrickable.com/api/');
  }
}

export async function apiGet<T>(
  url: string,
  params: Record<string, string | number> = {},
  headers?: Record<string, string>,
): Promise<T> {
  const apiURL = new URL(url);
  appendQueryParams(apiURL, params);

  const res = await requestUrl({
    url: apiURL.href,
    method: 'GET',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });

  return res.json as T;
}

function appendQueryParams(url: URL, params: Record<string, string | number>): void {
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });
}
