export type City = {
  country: string;
  geonameid: number;
  name: string;
  subcountry: string;
};

export type PaginatedResult<T> = {
  total: number;
  take: number;
  skip: number;
  items: T[];
};
