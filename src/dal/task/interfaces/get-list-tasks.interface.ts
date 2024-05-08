import { TaskWithAssignedPersonInclude } from '../types/task-with-user-include.type';

export interface GetListTasksInterface {
  data: TaskWithAssignedPersonInclude[];
  count: number;
}
