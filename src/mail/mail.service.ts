import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService
    ) { }
    
    async sendMail(email: string, template: string, subject: string ) {
        try {
            await this.mailerService.sendMail({
                to: email,
                from: `${process.env.MAILER_EMAIL}`,
                subject: subject,
                html: template
            })
        } catch (error) {
            console.log(error)
        }
    }
}
