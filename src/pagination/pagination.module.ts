import { Module } from '@nestjs/common';
import { PaginationController } from './pagination.controller';
import { PaginationService } from './pagination.service';

@Module({
  controllers: [PaginationController],
  providers: [PaginationService]
})
export class PaginationModule {}
