import { Type } from "class-transformer";
import { IsInstance, IsInt, IsNumber, IsOptional, Min } from "class-validator";

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  size: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @IsOptional()
  sort: 'asc' | 'desc' = 'desc';
}