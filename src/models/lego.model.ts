export interface FrontMatter {
  [key: string]: string | string[] | number;
}

export interface LegoSet {
  set_num: string; // Set number (e.g., "75192-1")
  name: string; // Set name
  year: number; // Release year
  theme_id?: number; // Theme ID
  theme?: string; // Theme name (e.g., "Star Wars", "City")
  num_parts: number; // Number of pieces
  set_img_url?: string; // Box art image URL
  set_url?: string; // Link to set details
  localCoverImage?: string; // Local path to downloaded cover image

  // Optional user fields
  status?: string; // Building status (Not Started, In Progress, Completed)
  purchaseDate?: string; // Date purchased
  buildDate?: string; // Date built
  myRate?: number | string; // User rating
  notes?: string; // User notes
  price?: string; // Purchase price
  tags?: string[];
}
