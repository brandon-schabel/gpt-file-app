import { useCallback, useMemo, useState } from "react";

type RequestStatus = "idle" | "loading" | "success" | "error" | "no data";

export function useFetcher<ResponseData extends unknown = unknown>() {
  const [data, setData] = useState<ResponseData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [status, setStatus] = useState<RequestStatus>("idle");

  async function get(endpoint: string): Promise<void> {
    setStatus("loading");
    try {
      const response = await fetch(endpoint);
      const result = (await response.json()) as ResponseData;
      setData(result);
      setLastUpdated(Date.now());
      setStatus("success");
    } catch (error) {
      setStatus("error");
      throw error;
    }
  }

  async function post<PostData extends object>(
    endpoint: string,
    postData: PostData
  ): Promise<void> {
    setStatus("loading");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      const result = (await response.json()) as ResponseData;
      setData(result);
      setLastUpdated(Date.now());
      setStatus("success");
    } catch (error) {
      setStatus("error");
      throw error;
    }
  }

  const getData = useCallback(() => {
    return data;
  }, [data]);

  const useData = () => {
    return useMemo(() => {
      return getData();
    }, [lastUpdated]);
  };

  return { get, post, getData, status, lastUpdated, useData };
}

export default useFetcher;
