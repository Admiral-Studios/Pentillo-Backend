import { ContactFullInclude } from '../entity-type/contact-full-include.type';

export interface GetListContactInterface {
  data: ContactFullInclude[];
  count: number;
}
