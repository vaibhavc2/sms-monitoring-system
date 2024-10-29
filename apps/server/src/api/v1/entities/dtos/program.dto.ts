export namespace ProgramDTO {
  export interface Upload {
    name: string;
    description?: string;
    fileName: string;
    userId: number;
  }

  export interface UpdateDetails {
    name: string;
    description?: string;
    userId: number;
    programId: string;
  }
}
