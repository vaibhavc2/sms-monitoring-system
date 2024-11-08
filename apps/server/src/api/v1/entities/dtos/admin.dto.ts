import { Role } from '@prisma/client';

export namespace AdminDTO {
  export interface Common {
    userId: number;
    currentUserId: number;
  }
  export interface ChangeRole extends Common {
    role: (typeof Role)[keyof typeof Role];
  }

  export interface DisableUser extends Common {
    disabledReason?: string;
  }

  export interface EnableUser extends Common {
    enabledReason?: string;
  }

  export interface GetPaginatedUsers {
    query?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortType?: 'asc' | 'desc';
  }
}
