export namespace CountryOperatorPairDTO {
  export interface Create {
    userId: number;
    programId: string;
    countryId: string;
    operatorId: string;
  }

  export interface Update {
    id: string;
    userId: number;
    programId?: string;
    countryId?: string;
    operatorId?: string;
    disabled?: boolean;
    highPriority?: boolean;
  }

  export interface Delete {
    id: string;
  }

  export interface Get {
    id: string;
  }

  export interface GetDesiredPairs {
    programId: string;
    disabled?: boolean;
    highPriority?: boolean;
  }

  export interface SearchById {
    query: {
      programId?: string;
      userId?: string;
      countryId?: string;
      operatorId?: string;
    };
  }

  export interface GetPaginatedResults {
    page: string;
    limit: string;
    sortBy: string;
    sortOrder: string;
  }
}
