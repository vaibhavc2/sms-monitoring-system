export namespace CountryDTO {
  export interface Create {
    name: string;
  }

  export interface Update {
    id: string;
    name: string;
  }

  export interface Delete {
    id: string;
  }

  export interface Get {
    id: string;
  }

  export interface Search {
    query: string;
  }

  export interface GetPaginatedResults {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    query?: string;
  }
}
