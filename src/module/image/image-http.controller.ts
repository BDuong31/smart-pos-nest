import { Controller, HttpCode, HttpStatus, Inject, Get, Post, Query, UploadedFile, UseGuards, UseInterceptors, Param, Patch, Body, Delete } from "@nestjs/common";
import { IMAGE_REPOSITORY, IMAGE_SERVICE } from "./image.di-token";
import type { IImageRepository, IImageService } from "./image.port";
import { FileInterceptor } from "@nestjs/platform-express";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { imageCondDTOSchema,type UpdateImageDTO, type CreateImageDTO, type ImageCondDTO } from "./image.dto";
import {paginatedResponse, type PagingDTO, pagingDTOSchema, ReqWithRequester, UserRole } from "src/share";
import { ImageType } from "./image.model";
import { undefinedProcessor } from "node_modules/zod/v4/core/json-schema-processors.cjs";
import { ApiBadRequestResponse, ApiBody, ApiConsumes, ApiCreatedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiServiceUnavailableResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
@Controller('v1/images')
export class ImageHttpController {
    constructor(
        @Inject(IMAGE_REPOSITORY) private readonly imageRepo: IImageRepository,
        @Inject(IMAGE_SERVICE) private readonly imageService: IImageService,
    ){}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(RemoteAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo mới hình ảnh', description: 'API này cho phép tạo mới một hình ảnh trong hệ thống. Người dùng cần phải xác thực mới có quyền truy cập.' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
    schema: {
        type: 'object',
        required: ['file', 'isMain', 'refId', 'type'],
        properties: {
        file: {
            type: 'string',
            format: 'binary',
            description: 'File hình ảnh upload'
        },
        isMain: {
            type: 'boolean',
            example: true,
            description: 'Có phải hình ảnh chính hay không'
        },
        refId: {
            type: 'string',
            example: 'uuid-of-product-or-category',
            description: 'ID tham chiếu (product/category)'
        },
        type: {
            type: 'string',
            example: 'product',
            description: 'Loại hình ảnh'
        }
        }
    }
    })
    @ApiCreatedResponse({ description: 'Hình ảnh được tạo thành công', schema: { example: { data: 'uuid-of-new-image' } } })  // Tài liệu phản hồi thành công
    @ApiBadRequestResponse({ description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiUnauthorizedResponse({ description: 'Không xác thực' })
    @ApiForbiddenResponse({ description: 'Không có quyền truy cập' })
    @ApiInternalServerErrorResponse({ description: 'Lỗi máy chủ' })
    async createImage(@Body() dto: CreateImageDTO, @UploadedFile() file: Express.Multer.File){
        const data = await this.imageService.create(dto, file);
        return { data };
    }
    
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy danh sách hình ảnh theo điều kiện lọc', description: 'API này cho phép lấy danh sách hình ảnh theo các điều kiện lọc như refId, type, isMain. Kết quả trả về có phân trang.' })
    
    @ApiQuery({
    name: 'refId',
    required: false,
    type: String,
    description: 'ID tham chiếu (product/category)',
    example: 'uuid-of-product-or-category',
    })

    @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    description: 'Loại hình ảnh',
    example: 'product',
    })

    @ApiQuery({
    name: 'isMain',
    required: false,
    type: Boolean,
    description: 'Có phải hình ảnh chính hay không',
    example: true,
    })

    @ApiQuery({
    name: 'url',
    required: false,
    type: String,
    description: 'URL của hình ảnh',
    example: 'https://example.com/image.jpg',
    })

    @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Số trang (bắt đầu từ 1)',
    example: 1,
    })

    @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Số lượng bản ghi mỗi trang',
    example: 10,
    })

    @ApiOkResponse({
    description: 'Danh sách hình ảnh trả về thành công',
    schema: {
        example: {
            data: [
                {
                id: 'uuid',
                url: 'https://example.com/image.jpg',
                refId: 'uuid-of-product',
                type: 'product',
                isMain: true
                }
            ],
            "paging": {
                    "page": 1,
                    "limit": 10
                },
            "total": 0,
            "filter": {
                "isMain": true,
                "refId": "uuid-of-product-or-category",
                "type": "product"
            }
        }
    }
    })
    @ApiInternalServerErrorResponse({ description: 'Lỗi máy chủ' })
    async listImage(@Query() dto: ImageCondDTO, @Query() paging: PagingDTO){
        paging = pagingDTOSchema.parse(paging);
        dto = imageCondDTOSchema.parse(dto);
        const data = await this.imageRepo.list(dto, paging);
        return paginatedResponse(data, dto);
    }
    
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy thông tin hình ảnh theo ID' })
    
    @ApiOkResponse({ description: 'Thông tin hình ảnh được trả về thành công' })
    @ApiBadRequestResponse({ description: 'ID không hợp lệ' })
    @ApiInternalServerErrorResponse({ description: 'Lỗi máy chủ' })
    async getImage(@Param('id') id: string){
        const data = await this.imageRepo.get(id);
        return { data };
    }

    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cập nhật thông tin hình ảnh', description: 'API này cho phép cập nhật thông tin hình ảnh như isMain, refId, type. Chỉ người dùng có vai trò ADMIN mới có quyền truy cập.' })
    @ApiConsumes('application/json')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                url: {
                    type: 'string',
                    example: 'https://example.com/image.jpg',
                    description: 'URL của hình ảnh'
                },
                isMain: {
                    type: 'boolean',
                    example: true,
                    description: 'Có phải hình ảnh chính hay không'
                },
                refId: {
                    type: 'string',
                    example: 'uuid-of-product-or-category',
                    description: 'ID tham chiếu (product/category)'
                },
            }
        }
    })
    @ApiOkResponse({ description: 'Thông tin hình ảnh được cập nhật thành công' })
    @ApiBadRequestResponse({ description: 'Dữ liệu đầu vào không hợp lệ' })
    @ApiUnauthorizedResponse({ description: 'Không xác thực' })
    @ApiForbiddenResponse({ description: 'Không có quyền truy cập' })
    @ApiNotFoundResponse({ description: 'Hình ảnh không tồn tại' })
    @ApiInternalServerErrorResponse({ description: 'Lỗi máy chủ' })
    async updateImage(@Param('id') id: string, @Body() dto: UpdateImageDTO){
        const data = await this.imageService.update(id, dto);
        return { data };
    }

    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Xóa hình ảnh theo ID', description: 'API này cho phép xóa một hình ảnh theo ID. Chỉ người dùng có vai trò ADMIN mới có quyền truy cập.' })
    @ApiOkResponse({ description: 'Hình ảnh được xóa thành công' })
    @ApiBadRequestResponse({ description: 'ID không hợp lệ' })
    @ApiUnauthorizedResponse({ description: 'Không xác thực' })
    @ApiForbiddenResponse({ description: 'Không có quyền truy cập' })
    @ApiNotFoundResponse({ description: 'Hình ảnh không tồn tại' })
    @ApiInternalServerErrorResponse({ description: 'Lỗi máy chủ' })
    async deleteImage(@Param('id') id: string){
        const data = await this.imageService.delete(id);
        return { data };
    }

    @Post('rpc/get-by-ref-id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'RPC: Lấy danh sách hình ảnh theo refId và type', description: 'API này cho phép lấy danh sách hình ảnh theo refId và type. Kết quả trả về có thể lọc theo isMain.' })
    @ApiOkResponse({ description: 'Danh sách hình ảnh được trả về thành công', 
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'uuid-of-image' },
                    url: { type: 'string', example: 'https://example.com/image.jpg' },
                    isMain: { type: 'boolean', example: true },
                    refId: { type: 'string', example: 'uuid-of-product-or-category' },
                    type: { type: 'string', example: ImageType.PRODUCT },
                    createdAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
                    updatedAt: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00Z' },
                }
            }
        }
    })
    @ApiInternalServerErrorResponse({ description: 'Lỗi máy chủ' })
    async getImageByRefId(@Body() dto: { refId:string[], type: ImageType, isMain?: boolean}){
        if (dto.isMain === undefined){
            const data= await this.imageRepo.listByRefIds(dto.refId, dto.type);
            return { data };
        } else {
            const data= await this.imageRepo.listByRefIds(dto.refId, dto.type, dto.isMain);
            return { data };
        }
    }
}