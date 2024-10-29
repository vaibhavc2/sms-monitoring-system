export namespace ProgramDTO {
  export interface Upload {
    name: string;
    description?: string;
    fileName: string;
    serverFileName: string;
    userId: number;
  }

  export interface UpdateDetails {
    name: string;
    description?: string;
    userId: number;
    programId: string;
  }

  export interface UpdateFile {
    fileName: string;
    serverFileName: string;
    userId: number;
    programId: string;
  }

  export interface Common {
    programId: string;
  }

  export interface GetPrograms {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    query?: string;
  }
}
