import { List } from '@prisma/client';

export interface GetListsInterface {
  data: List[];
  count: number;
}
