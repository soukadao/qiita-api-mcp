import { Result, ok, err } from 'neverthrow';
import { BASE_URL, QIITA_API_ACCESSS_TOKEN } from '../../shared/config.js';
import { Item, FetchItemsParams, FetchItemsParamsSchema } from './types.js';

const accessToken = QIITA_API_ACCESSS_TOKEN;

async function fetchItems(params: FetchItemsParams = {}): Promise<Result<any[], Error>> {
  // パラメータのバリデーション
  const validation = FetchItemsParamsSchema.safeParse(params);
  if (!validation.success) {
    const errors = validation.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return err(new Error(`Invalid parameters: ${errors}`));
  }
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.append('page', params.page.toString());
  }
  if (params.per_page) {
    searchParams.append('per_page', params.per_page.toString());
  }
  if (params.query) {
    searchParams.append('query', params.query);
  }

  const url = `${BASE_URL}/items${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    return err(new Error(`HTTP error! status: ${response.status}`));
  }

  const data = await response.json() as Item[];

  // フィールドの制限処理
  const filteredData = data.map(item => {
    // デフォルトフィールド
    const defaultFields = {
      title: item.title,
      url: item.url,
      created_at: item.created_at,
      user: {
        name: item.user.name
      }
    };

    // 追加フィールドがある場合は、それらも含める
    if (params.additional_fields && params.additional_fields.length > 0) {
      const additionalData: any = {};

      for (const field of params.additional_fields) {
        if (field.includes('.')) {
          // ネストしたフィールド（例: user.id）の処理
          const [parent, child] = field.split('.');
          if (item[parent as keyof Item] && typeof item[parent as keyof Item] === 'object') {
            if (!additionalData[parent]) {
              additionalData[parent] = {};
            }
            additionalData[parent][child] = (item[parent as keyof Item] as any)[child];
          }
        } else {
          // 直接フィールドの処理
          if (field in item) {
            additionalData[field] = item[field as keyof Item];
          }
        }
      }

      // デフォルトフィールドと追加フィールドを深くマージ
      const result: any = { ...defaultFields };
      for (const [key, value] of Object.entries(additionalData)) {
        if (key in result && typeof result[key] === 'object' && typeof value === 'object') {
          // オブジェクトの場合はマージ
          result[key] = { ...result[key], ...value };
        } else {
          // プリミティブの場合は上書き
          result[key] = value;
        }
      }
      return result;
    }

    return defaultFields;
  });

  return ok(filteredData);
}

export { fetchItems };