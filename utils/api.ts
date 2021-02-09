import { City, PaginatedResult } from "../interfaces";
import { cities } from "./sample-data";

export const findCities = (
  filter: string,
  skip: number,
  take: number
): CancellablePromise<PaginatedResult<City>> => {
  console.log(filter + " " + skip);
  if (!filter) {
    const promise = (Promise.resolve({
      total: 0,
      take: 0,
      skip: 0,
      items: [],
    }) as unknown) as CancellablePromise<PaginatedResult<City>>;

    promise.cancel = () => {};

    return promise;
  }

  let isCancelled = false;

  const promise = new Promise<PaginatedResult<City>>((resolve) => {
    setTimeout(() => {
      const filtered = cities
        .filter((c) => c.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
        .sort((a, b) => (a.name > b.name ? 1 : -1));
      if (!isCancelled) {
        resolve({
          total: filtered.length,
          take,
          skip,
          items: filtered.slice(skip, skip + take),
        });
      }
    }, 1000);
  });

  (promise as any).cancel = () => {
    isCancelled = true;
  };

  return (promise as unknown) as CancellablePromise<PaginatedResult<City>>;
};

export interface CancellablePromise<T> extends Promise<T> {
  cancel: () => void;
}


class ExtendedPromise<T> extends Promise<T> {
  constructor(resolver: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    super(resolver);
  }
}

async function F(): ExtendedPromise<number> {
  return null;
}