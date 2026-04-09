
import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { RATING_SERVICE } from "../sales.di-token";
import type { IRatingService } from "../ports/rating.port";
import {ratingCreateDTOSchema, type RatingCondDTO } from "../dtos/rating.dto";
import {type PagingDTO, pagingDTOSchema } from "src/share";


@Controller('v1/ratings')
export class RatingController {
    constructor(
        @Inject(RATING_SERVICE) private readonly ratingService: IRatingService,
    ) {}

    @Get()
    async getRating(@Query() query: RatingCondDTO, @Query() paging: PagingDTO) {
        query = ratingCreateDTOSchema.parse(query);
        paging = pagingDTOSchema.parse(paging);
        return this.ratingService.list(query, paging);
    }

    @Get(':id')
    async getRatingById(@Param('id') id: string) {
        return this.ratingService.get(id);
    }

    
}