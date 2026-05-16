import { NextRequest } from "next/server";

type ApiRequestOptions = {
  body?: unknown;
  method?: string;
  searchParams?: Record<string, string>;
};

export const createApiRequest = (
  path: string,
  { body, method = "GET", searchParams }: ApiRequestOptions = {},
) => {
  const url = new URL(`http://localhost:3007${path}`);

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    url.searchParams.set(key, value);
  }

  return new NextRequest(url, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    method,
  });
};

export const routeContext = <TParams extends Record<string, string>>(
  params: TParams,
) => ({
  params: Promise.resolve(params),
});

export const readJson = async <TBody = unknown>(response: Response) =>
  (await response.json()) as TBody;
