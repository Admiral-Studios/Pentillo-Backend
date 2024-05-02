import { MembersFullInclude } from '../entity-types/members-full-include.type';

export interface GetMembersInterface {
  data: MembersFullInclude[];
  count: number;
}
