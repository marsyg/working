export const apiClient = async (
  url: string,
  options: RequestInit = {}
): Promise<[any | null, Error | null]> => {
  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json();
    return [data, null];
  } catch (error: any) {
    console.error("API Client Error:", error.message || error);
    return [null, error];
  }
};


/*
Usage: 
async function fetchUsers() {
  const [data, error] = await apiClient('/api/users');

  if (error) {
    console.error('Failed to fetch users:', error.message);
    return;
  }

  console.log('Fetched users:', data);
}
*/