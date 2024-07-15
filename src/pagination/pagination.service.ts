import { Injectable } from '@nestjs/common';
import { PaginationDto } from './dto/pagination-dto';

@Injectable()
export class PaginationService {
    async paginate(repository: any, query: PaginationDto, relations?: string[]) {
        const { size = 1, page = 1, sort } = query   
        
        const skip = (page - 1) * size
    
        
        const [result, total] = await repository.findAndCount({
                skip,
                take: size > 20 ? 20 : size,
                order: {
                    createdAt: sort === 'asc' ? 'ASC' : 'DESC'
            },
                relations
            })
        
        const lastPage = Math.ceil(total / size)
        
        return {
            data: result,
            meta: {
                total,
                page,
                size,
                lastPage
            }

        }

    }
}
