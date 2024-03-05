import { Body, Controller, Post } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { ProfileDto } from 'src/dto/profile.dto';
import { User } from 'src/utils/user.decorator';

@Controller('profile')
export class UserProfileController {
    constructor(private readonly userProfileService: UserProfileService) { }
    
    @Post('create')
    async createProfile(@Body() payload: ProfileDto, @User('id') userId: string) {
        return await this.userProfileService.createProfile(payload, userId)
    }
}
