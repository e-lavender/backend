import { Injectable } from '@nestjs/common';
import { EmailAdapter } from '../adapter/email.adapter';
import { GlobalConfigService } from '../../../../config/config.service';
import { ResultDTO } from '../../../../../../libs/dtos/resultDTO';
import { InternalCode } from '../../../../../../libs/enums';

@Injectable()
export class EmailManager {
  constructor(
    private emailAdapter: EmailAdapter,
    private configService: GlobalConfigService,
  ) {}

  async sendEmailRegistrationMessage(
    email: string,
    confirmationCode: string,
  ): Promise<ResultDTO<null>> {
    const domain = this.configService.getDomain();

    const message =
      '<h1>Thank for your registration</h1>' +
      '<p>To finish registration please follow the link below:' +
      `<a href="${domain}auth/registration-confirmation?code=${confirmationCode}">complete registration</a>` +
      '</p>';

    const subject = 'Registration Confirmation';

    const isSending = await this.emailAdapter.sendEmail(
      email,
      subject,
      message,
    );
    if (!isSending) return new ResultDTO(InternalCode.Internal_Server);

    return new ResultDTO(InternalCode.Success);
  }

  async sendEmailRecoverPasswordMessage(
    email: string,
    recoveryCode: string,
  ): Promise<ResultDTO<null>> {
    const domain = this.configService.getDomain();

    const message =
      '<h1>Password recovery</h1>' +
      '<p>To finish password recovery please follow the link below:\n' +
      `<a href="${domain}auth/confirm-password-recovery?code=${recoveryCode}">recovery password</a>\n` +
      '</p>';

    const subject = 'Registration Confirmation';

    const isSending = await this.emailAdapter.sendEmail(
      email,
      subject,
      message,
    );
    if (!isSending) return new ResultDTO(InternalCode.Internal_Server);

    return new ResultDTO(InternalCode.Success);
  }
}
