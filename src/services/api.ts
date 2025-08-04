const API_BASE_URL = 'http://localhost:5000/api';

interface FetchDrugsParams {
  search?: string;
  page?: number;
  limit?: number;
}

interface Drug {
  Drugname?: string;
  Price?: number;
  Company?: string;
  Form?: string;
  Category?: string;
  [key: string]: any;
}

interface ApiResponse {
  drugs: Drug[];
  total: number;
  page: number;
  totalPages: number;
}

export const drugsAPI = {
  fetchDrugs: async ({ search = '', page = 1, limit = 12 }: FetchDrugsParams): Promise<ApiResponse> => {
    const url = new URL(`${API_BASE_URL}/drugs`);
    url.searchParams.append('search', search);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
      throw new Error(errorData.message || 'An unknown error occurred');
    }
    
    return response.json();
  },
};
