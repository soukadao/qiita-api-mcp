import { z } from 'zod';

export interface Item {
  rendered_body: string;
  body: string;
  coediting: boolean;
  comments_count: number;
  created_at: string;
  group: null | string;
  id: string;
  likes_count: number;
  private: boolean;
  reactions_count: number;
  tags: { name: string; versions: string[] }[];
  title: string;
  updated_at: string;
  url: string;
  user: {
    description: string | null;
    facebook_id: string | null;
    followees_count: number;
    followers_count: number;
    github_login_name: string | null;
    id: string;
    items_count: number;
    linkedin_id: string | null;
    location: string | null;
    name: string;
    organization: string | null;
    permanent_id: number;
    profile_image_url: string;
    team_only: boolean;
    twitter_screen_name: string | null;
    website_url: string | null;
  },
  page_views_count: number | null;
  team_membership: string | null;
  organization_url_name: string | null;
  slide: boolean;
}

export interface FetchItemsParams {
  page?: number;
  per_page?: number;
  query?: string;
  additional_fields?: string[];
}

export const FetchItemsParamsSchema = z.object({
  page: z.number().int().min(1).max(100).optional(),
  per_page: z.number().int().min(1).max(100).optional(),
  query: z.string().optional(),
  additional_fields: z.array(z.string()).optional()
});