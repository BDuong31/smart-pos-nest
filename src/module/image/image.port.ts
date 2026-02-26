import { Image } from './image.model';
import { Paginated, PagingDTO } from 'src/share';
import { CreateImageDTO, ImageCondDTO, UpdateImageDTO } from './image.dto';

export interface IImageService {
    create(dto: CreateImageDTO, file: Express.Multer.File): Promise<string>;
    update(imageId: string, dto: UpdateImageDTO): Promise<boolean>;
    delete(imageId: string): Promise<boolean>;
}

export interface IImageRepository {
    get(id: string): Promise<Image | null>;
    list(cond: ImageCondDTO, paging: PagingDTO): Promise<Paginated<Image>>;
    listByIds(ids: string[]): Promise<Image[]>;
    listByRefIds(refId: string[], type: string, isMain?: boolean): Promise<Image[]>;

    insert(image: Image): Promise<void>;
    update(id: string, dto: UpdateImageDTO): Promise<void>;
    delete(id: string): Promise<void>;
}