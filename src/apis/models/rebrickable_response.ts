export interface RebrickableResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RebrickableSet[];
}

export interface RebrickableSet {
  set_num: string;
  name: string;
  year: number;
  theme_id: number;
  num_parts: number;
  set_img_url: string | null;
  set_url: string;
  last_modified_dt: string;
}

export interface RebrickableTheme {
  id: number;
  parent_id: number | null;
  name: string;
}
