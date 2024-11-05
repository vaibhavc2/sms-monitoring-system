export namespace ProgramSessionDTO {
  export interface Create {
    programId: string;
    countryOperatorPairId: string;
    name: string;
  }

  export interface Common {
    sessionId: string;
    userId: number;
  }

  export interface Paginated {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    query?: string;
  }

  export interface PaginatedExtended extends Paginated {
    filter?: {
      status?: string;
      lastAction?: string;
      createdBy?: string;
      updatedBy?: string;
      programId?: string;
      countryOperatorPairId?: string;
    };
  }
}
