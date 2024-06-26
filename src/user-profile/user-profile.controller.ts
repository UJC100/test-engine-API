import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { ProfileDto } from 'src/user-profile/dto/profile.dto';
import { User } from 'src/custome-decorators/user.decorator';
import { JwtAuthGuard } from 'src/jwt-auth/jwt.guard';
import { UpdateProfileDto } from './dto/profile.dto';
import { UserSignup } from 'src/entities/signUp.details';

@Controller('profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createProfile(@Body() payload: ProfileDto, @User('id') userId: string) {
    return await this.userProfileService.createProfile(payload, userId);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  async updateUserProfile(
    @Body() payload: UpdateProfileDto,
    @Param('id') userId: string,
    @User('id') jwtId: string,
  ) {
    return await this.userProfileService.updateUserProfile(
      payload,
      userId,
      jwtId,
    );
  }

  @Delete('deleteProfile/:id')
  @UseGuards(JwtAuthGuard)
  async deleteProfile(
    @Param('id') profileId: string,
    @User('id') userId: string,
  ) {
    return await this.userProfileService.deleteProfile(profileId, userId);
  }
}
