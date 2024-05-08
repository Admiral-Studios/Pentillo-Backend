import { ConfigService } from '@nestjs/config';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as sgMail from '@sendgrid/mail';

@Processor('email')
export class SendgridProcessor {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  @Process('send')
  async sendEmail(job: Job<any>): Promise<any> {
    try {
      console.log('job', job.data);
      const msg = {
        to: job.data.to,
        from: this.configService.get<string>('EMAIL_FROM'),
        templateId: job.data.templateId,
        dynamicTemplateData: job.data.data,
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent');
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      throw error;
    }
  }
}
