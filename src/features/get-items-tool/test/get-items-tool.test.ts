import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchItems } from '../get-items-tool.js';
import { FetchItemsParams } from '../types.js';

global.fetch = vi.fn();

describe('fetchItems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default fields only when no additional_fields specified', async () => {
    const mockResponse = [
      {
        id: '1',
        title: 'Test Article',
        body: 'Test content',
        rendered_body: '<p>Test content</p>',
        coediting: false,
        comments_count: 5,
        created_at: '2023-01-01T00:00:00Z',
        group: null,
        likes_count: 10,
        private: false,
        reactions_count: 2,
        tags: [{ name: 'JavaScript', versions: [] }],
        updated_at: '2023-01-02T00:00:00Z',
        url: 'https://qiita.com/test/items/1',
        user: {
          description: 'Test user',
          facebook_id: null,
          followees_count: 100,
          followers_count: 200,
          github_login_name: 'testuser',
          id: 'user1',
          items_count: 50,
          linkedin_id: null,
          location: 'Tokyo',
          name: 'Test User',
          organization: 'Test Org',
          permanent_id: 12345,
          profile_image_url: 'https://example.com/avatar.png',
          team_only: false,
          twitter_screen_name: 'testuser',
          website_url: 'https://example.com'
        },
        page_views_count: 1000,
        team_membership: null,
        organization_url_name: null,
        slide: false
      }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const result = await fetchItems();

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toHaveLength(1);
      const item = result.value[0];

      // Default fields should be included
      expect(item.title).toBe('Test Article');
      expect(item.url).toBe('https://qiita.com/test/items/1');
      expect(item.created_at).toBe('2023-01-01T00:00:00Z');
      expect(item.user.name).toBe('Test User');

      // Other fields should NOT be included
      expect(item.id).toBeUndefined();
      expect(item.body).toBeUndefined();
      expect(item.likes_count).toBeUndefined();
      expect(item.tags).toBeUndefined();
    }
  });

  it('should include additional fields when specified', async () => {
    const mockResponse = [
      {
        id: '1',
        title: 'Test Article',
        body: 'Test content',
        rendered_body: '<p>Test content</p>',
        coediting: false,
        comments_count: 5,
        created_at: '2023-01-01T00:00:00Z',
        group: null,
        likes_count: 10,
        private: false,
        reactions_count: 2,
        tags: [{ name: 'JavaScript', versions: [] }],
        updated_at: '2023-01-02T00:00:00Z',
        url: 'https://qiita.com/test/items/1',
        user: {
          description: 'Test user',
          facebook_id: null,
          followees_count: 100,
          followers_count: 200,
          github_login_name: 'testuser',
          id: 'user1',
          items_count: 50,
          linkedin_id: null,
          location: 'Tokyo',
          name: 'Test User',
          organization: 'Test Org',
          permanent_id: 12345,
          profile_image_url: 'https://example.com/avatar.png',
          team_only: false,
          twitter_screen_name: 'testuser',
          website_url: 'https://example.com'
        },
        page_views_count: 1000,
        team_membership: null,
        organization_url_name: null,
        slide: false
      }
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const params: FetchItemsParams = {
      additional_fields: ['id', 'likes_count', 'tags', 'user.id']
    };

    const result = await fetchItems(params);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toHaveLength(1);
      const item = result.value[0] as any;

      // Default fields should be included
      expect(item.title).toBe('Test Article');
      expect(item.url).toBe('https://qiita.com/test/items/1');
      expect(item.created_at).toBe('2023-01-01T00:00:00Z');
      expect(item.user.name).toBe('Test User');

      // Additional fields should be included
      expect(item.id).toBe('1');
      expect(item.likes_count).toBe(10);
      expect(item.tags).toEqual([{ name: 'JavaScript', versions: [] }]);
      expect(item.user.id).toBe('user1');

      // Other fields should NOT be included
      expect(item.body).toBeUndefined();
      expect(item.comments_count).toBeUndefined();
    }
  });

  it('should include parameters in URL correctly', async () => {
    const params: FetchItemsParams = {
      page: 2,
      per_page: 10,
      query: 'JavaScript'
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    await fetchItems(params);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2'),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('per_page=10'),
      expect.any(Object)
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('query=JavaScript'),
      expect.any(Object)
    );
  });

  it('should return error when HTTP error occurs', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const result = await fetchItems();

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain('404');
    }
  });

  it('should return validation error when page is less than 1', async () => {
    const params: FetchItemsParams = {
      page: 0
    };

    const result = await fetchItems(params);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain('Invalid parameters');
    }
  });

  it('should return validation error when page is greater than 100', async () => {
    const params: FetchItemsParams = {
      page: 101
    };

    const result = await fetchItems(params);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain('Invalid parameters');
    }
  });

  it('should return validation error when per_page is less than 1', async () => {
    const params: FetchItemsParams = {
      per_page: 0
    };

    const result = await fetchItems(params);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain('Invalid parameters');
    }
  });

  it('should return validation error when per_page is greater than 100', async () => {
    const params: FetchItemsParams = {
      per_page: 101
    };

    const result = await fetchItems(params);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain('Invalid parameters');
    }
  });

  it('should return validation error when page is not integer', async () => {
    const params = {
      page: 1.5
    } as FetchItemsParams;

    const result = await fetchItems(params);

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain('Invalid parameters');
    }
  });

  it('should work without parameters', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    const result = await fetchItems();

    expect(result.isOk()).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.not.stringContaining('?'),
      expect.any(Object)
    );
  });

  it('should send correct Authorization header', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    await fetchItems();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Bearer ')
        })
      })
    );
  });
});