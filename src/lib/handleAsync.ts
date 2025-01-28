type AsyncFn<T> = (...args: any[]) => Promise<T>;

export const handleAsync = async <T>(
  fn: AsyncFn<T>
): Promise<[T | null, Error | null]> => {
  try {
    const result = await fn();
    return [result, null];
  } catch (error: any) {
    console.error("Error:", error.message || error);
    return [null, error];
  }
};


/*Backend Usage Example

async function createUser(data: { name: string; email: string }) {
  const [newUser, error] = await handleAsync(() =>
    prisma.user.create({
      data,
    })
  );

  if (error) {
    console.error("Error creating user:", error.message);
    return null; // Or throw an error depending on your use case
  }

  return newUser;
}
*/


/*Frontend-API Usage Example

async function fetchData() {
  const [data, error] = await handleAsync(async () => {
    const res = await fetch('/api/example');
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

  if (error) {
    console.error('Fetch error:', error.message);
    return;
  }

  console.log('Fetched data:', data);
}
*/