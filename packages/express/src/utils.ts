import type { ContentCallback } from "./type";

export const defaultContentCallback: ContentCallback = <T = string | Record<string, string>>(result: T) => {
  return JSON.stringify(result);
};
