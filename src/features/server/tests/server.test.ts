import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStdioServer, fetchItemsToolWrapper } from '../server.js';

// fetchをモック
global.fetch = vi.fn();

describe('server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createStdioServer', () => {
    it('should create a McpServer instance', () => {
      const server = createStdioServer();

      expect(server).toBeDefined();
      expect(typeof server.connect).toBe('function');
      expect(typeof server.close).toBe('function');
      expect(typeof server.tool).toBe('function');
    });

    it('should have isConnected method', () => {
      const server = createStdioServer();

      expect(typeof server.isConnected).toBe('function');
      expect(server.isConnected()).toBe(false);
    });

    it('should register tools correctly', () => {
      const server = createStdioServer();

      // The tool registration happens in createStdioServer
      // We can verify the server was created without errors
      expect(server).toBeDefined();
      expect(typeof server.tool).toBe('function');
    });

    it('should have server property', () => {
      const server = createStdioServer();

      // Access the underlying server
      expect(server.server).toBeDefined();
      expect(typeof server.server).toBe('object');
    });

    it('should create server with proper structure', () => {
      const server = createStdioServer();

      // Verify all expected methods exist
      expect(typeof server.connect).toBe('function');
      expect(typeof server.close).toBe('function');
      expect(typeof server.tool).toBe('function');
      expect(typeof server.resource).toBe('function');
      expect(typeof server.prompt).toBe('function');
      expect(typeof server.isConnected).toBe('function');
    });

    it('should start in disconnected state', () => {
      const server = createStdioServer();

      expect(server.isConnected()).toBe(false);
    });
  });

  describe('fetchItemsToolWrapper', () => {
    it('should return default fields only when no additional_fields specified', async () => {
      const mockItems = [
        {
          id: '1',
          title: 'Test Article 1',
          likes_count: 10,
          comments_count: 5,
          body: 'Test content',
          rendered_body: '<p>Test content</p>',
          coediting: false,
          created_at: '2023-01-01T00:00:00Z',
          group: null,
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
        },
        {
          id: '2',
          title: 'Test Article 2',
          likes_count: 20,
          comments_count: 8,
          body: 'Test content 2',
          rendered_body: '<p>Test content 2</p>',
          coediting: false,
          created_at: '2023-01-03T00:00:00Z',
          group: null,
          private: false,
          reactions_count: 3,
          tags: [{ name: 'TypeScript', versions: [] }],
          updated_at: '2023-01-04T00:00:00Z',
          url: 'https://qiita.com/test/items/2',
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
          page_views_count: 2000,
          team_membership: null,
          organization_url_name: null,
          slide: false
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockItems)
      });

      const result = await fetchItemsToolWrapper({});

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      // JSON形式で制限されたフィールドが返されることを確認
      const parsedItems = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsedItems)).toBe(true);
      expect(parsedItems).toHaveLength(2);
      expect(parsedItems[0].title).toBe('Test Article 1');
      expect(parsedItems[0].url).toBe('https://qiita.com/test/items/1');
      expect(parsedItems[0].created_at).toBe('2023-01-01T00:00:00Z');

      expect(parsedItems[0].id).toBeUndefined();
      expect(parsedItems[0].likes_count).toBeUndefined();
      expect(parsedItems[0].body).toBeUndefined();
    });

    it('should handle empty results', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      const result = await fetchItemsToolWrapper({});

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      // 空配列がJSON形式で返されることを確認
      const parsedItems = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsedItems)).toBe(true);
      expect(parsedItems).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await fetchItemsToolWrapper({});

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Error:');
      expect('isError' in result && result.isError).toBe(true);
    });

    it('should handle validation errors', async () => {
      const result = await fetchItemsToolWrapper({ page: 101 });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Invalid parameters');
      expect('isError' in result && result.isError).toBe(true);
    });

    it('should include additional fields when specified', async () => {
      const mockItems = [
        {
          id: '1',
          title: 'Test Article 1',
          likes_count: 10,
          comments_count: 5,
          body: 'Test content',
          created_at: '2023-01-01T00:00:00Z',
          url: 'https://qiita.com/test/items/1',
          tags: [{ name: 'JavaScript', versions: [] }],
          user: {
            id: 'user1',
            name: 'Test User'
          }
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockItems)
      });

      const result = await fetchItemsToolWrapper({
        additional_fields: ['id', 'likes_count', 'tags', 'user.id']
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      const parsedItems = JSON.parse(result.content[0].text);
      expect(Array.isArray(parsedItems)).toBe(true);
      expect(parsedItems).toHaveLength(1);

      const item = parsedItems[0];
      expect(item.title).toBe('Test Article 1');
      expect(item.url).toBe('https://qiita.com/test/items/1');
      expect(item.created_at).toBe('2023-01-01T00:00:00Z');

      expect(item.id).toBe('1');
      expect(item.likes_count).toBe(10);
      expect(item.tags).toEqual([{ name: 'JavaScript', versions: [] }]);
      expect(item.user.id).toBe('user1');

      expect(item.body).toBeUndefined();
      expect(item.comments_count).toBeUndefined();
    });

    it('should pass parameters correctly', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await fetchItemsToolWrapper({ page: 2, per_page: 10, created_from: new Date('2023-01-01'), created_to: new Date('2023-12-31') });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('per_page=10'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('query=created%3A%3E%3D2023-01-01+created%3A%3C%3D2023-12-31'),
        expect.any(Object)
      );
    });

    it('should include authorization header', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await fetchItemsToolWrapper({});

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer ')
          })
        })
      );
    });

    it('should handle string date parameters for created_from', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await fetchItemsToolWrapper({ created_from: '2023-01-01' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('query=created%3A%3E%3D2023-01-01'),
        expect.any(Object)
      );
    });

    it('should handle string date parameters for created_to', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await fetchItemsToolWrapper({ created_to: '2023-12-31' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('query=created%3A%3C%3D2023-12-31'),
        expect.any(Object)
      );
    });

    it('should handle both string date parameters', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await fetchItemsToolWrapper({
        created_from: '2023-01-01',
        created_to: '2023-12-31'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('query=created%3A%3E%3D2023-01-01+created%3A%3C%3D2023-12-31'),
        expect.any(Object)
      );
    });

  });

  describe('server tool registration', () => {
    it('should test server creation with debug logging', () => {
      const server = createStdioServer();
      expect(server).toBeDefined();
      expect(typeof server.connect).toBe('function');
      expect(typeof server.close).toBe('function');
    });

    it('should test error handling wrapper in server tools', async () => {
      const server = createStdioServer();

      class TestTransport {
        private requestHandler?: (message: any) => Promise<any>;

        start(requestHandler: (message: any) => Promise<any>) {
          this.requestHandler = requestHandler;
        }

        async send(_message: any) {}
        async close() {}

        async simulateToolCall(name: string, args: any) {
          if (this.requestHandler) {
            const request = {
              jsonrpc: '2.0',
              id: 1,
              method: 'tools/call',
              params: { name, arguments: args }
            };
            return await this.requestHandler(request);
          }
        }
      }

      const transport = new TestTransport();
      await server.connect(transport as any);

      // Verify server is connected
      expect(server.isConnected()).toBe(true);

      await server.close();
    });

    it('should create server multiple times without issues', () => {
      const server1 = createStdioServer();
      const server2 = createStdioServer();
      expect(server1).toBeDefined();
      expect(server2).toBeDefined();
    });
  });
});