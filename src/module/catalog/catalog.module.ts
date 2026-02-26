import { Module, Provider } from "@nestjs/common";
import { CATEGORY_REPOSITORY, CATEGORY_SERVICE, PRODUCT_REPOSITORY, PRODUCT_SERVICE, OPTION_REPOSITORY,OPTION_SERVICE } from "./catalog.di-token";
import { CategoryPrismaRepo } from "./repos/category-prisma.repo";
import { CategoryService } from "./services/category.service";
import { ShareModule } from "src/share/module";
import { CategoryHttpController, CategoryRpcController } from "./controller/category-http.controller";
import { ProductService } from "./services/product.service";
import { ProductRepository } from "./repos/product-prisma.repo";
import { ProductHttpController, ProductRpcController, VariantHttpController, VariantRpcController } from "./controller/product-http.controller";
import { OptionService } from "./services/option.service";
import { OptionPrismaRepository } from "./repos/option-prisma.repo";
import { OptionHttpController, OptionRpcController } from "./controller/option-http.controller";

const dependencies: Provider[] = [
    // Provider Category
    { provide: CATEGORY_REPOSITORY, useClass: CategoryPrismaRepo},
    { provide: CATEGORY_SERVICE, useClass: CategoryService},
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepository}, 
    { provide: PRODUCT_SERVICE, useClass: ProductService},
    { provide: OPTION_REPOSITORY, useClass: OptionPrismaRepository},
    { provide: OPTION_SERVICE, useClass: OptionService},
]

@Module({
    imports: [ShareModule],
    controllers: [CategoryHttpController, CategoryRpcController, ProductHttpController, ProductRpcController, VariantHttpController, VariantRpcController, OptionHttpController, OptionRpcController],
    providers: [...dependencies],
})

export class CatalogModule {}