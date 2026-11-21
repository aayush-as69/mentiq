/** Small fetch wrapper for client components: JSON in/out, readable errors. */
export async function api(url, { method = "GET", body } = {}) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await response.json();
  } catch {
    // non-JSON response
  }
  if (!response.ok) throw new Error(data?.error ?? "Something went wrong. Please check your connection and try again.");
  return data;
}
