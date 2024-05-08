import { Module } from '@nestjs/common';

import { DalModule } from '../dal/dal.module';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';

@Module({
  imports: [DalModule],
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
