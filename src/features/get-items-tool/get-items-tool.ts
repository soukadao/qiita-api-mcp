import { Result, ok, err } from 'neverthrow';
import { format } from 'date-fns';
import { BASE_URL, QIITA_API_ACCESS_TOKEN } from '../../shared/config.js';
import { Item, FetchItemsParams, FetchItemsParamsSchema } from './types.js';

const accessToken = QIITA_API_ACCESS_TOKEN;

async function fetchItems(params: FetchItemsParams = {}): Promise<Result<any[], Error>> {
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

  const queryParts: string[] = [];
  if (params.created_from) {
    queryParts.push(`created:>=${format(params.created_from, 'yyyy-MM-dd')}`);
  }
  if (params.created_to) {
    queryParts.push(`created:<=${format(params.created_to, 'yyyy-MM-dd')}`);
  }
  if (params.tags && params.tags.length > 0) {
    queryParts.push(`tag:${params.tags.join(',')}`);
  }
  if (queryParts.length > 0) {
    searchParams.append('query', queryParts.join(' '));
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

  const filteredData = data.map(item => {
    const defaultFields = {
      title: item.title,
      url: item.url,
      created_at: item.created_at
    };

    if (params.additional_fields && params.additional_fields.length > 0) {
      const additionalData: any = {};

      for (const field of params.additional_fields) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          if (item[parent as keyof Item] && typeof item[parent as keyof Item] === 'object') {
            if (!additionalData[parent]) {
              additionalData[parent] = {};
            }
            additionalData[parent][child] = (item[parent as keyof Item] as any)[child];
          }
        } else {
          if (field in item) {
            additionalData[field] = item[field as keyof Item];
          }
        }
      }

      const result: any = { ...defaultFields };
      for (const [key, value] of Object.entries(additionalData)) {
        if (key in result && typeof result[key] === 'object' && typeof value === 'object') {
          result[key] = { ...result[key], ...value };
        } else {
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