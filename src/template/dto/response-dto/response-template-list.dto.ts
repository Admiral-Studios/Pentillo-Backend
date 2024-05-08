import { Exclude, Expose, Type } from 'class-transformer';
import { TemplateResponseDto } from './response-template.dto';

@Exclude()
export class TemplateListResponse {
  @Expose()
  @Type(() => TemplateResponseDto)
  data: TemplateResponseDto[];

  @Expose()
  count: number;
}
