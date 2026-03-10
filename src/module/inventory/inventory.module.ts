import { Module, Provider } from "@nestjs/common";
import { IMPORTINVOICE_REPOSITORY, IMPORTINVOICE_SERVICE, IMPORTINVOICEDETAIL_REPOSITORY, IMPORTINVOICEDETAIL_SERVICE, INGREDIENT_REPOSITORY, INGREDIENT_SERVICE, INVENTORYBATCH_REPOSITORY, INVENTORYBATCH_SERVICE, PURCHASEPROPOSAL_REPOSITORY, PURCHASEPROPOSAL_SERVICE, PURCHASEPROPOSALDETAIL_REPOSITORY, PURCHASEPROPOSALDETAIL_SERVICE, RECIPE_REPOSITORY, RECIPE_SERVICE, STOCKCHECK_REPOSITORY, STOCKCHECK_SERVICE, STOCKCHECKDETAIL_REPOSITORY, STOCKCHECKDETAIL_SERVICE, SUPPLIER_REPOSITORY, SUPPLIER_SERVICE, UNITCONVERSION_REPOSITORY, UNITCONVERSION_SERVICE  } from "./inventory.di-token";
import { SupplierService } from "./services/supplier.serivce";
import { SupplierPrismaRepo } from "./repos/supplier-prisma.repo";
import { IngredientService } from "./services/ingredient.service";
import { IngredientPrismaRepo } from "./repos/ingredient-prisma.repo";
import { UnitConversionService } from "./services/unitConversion.service";
import { UnitConversionPrismaRepo } from "./repos/unitConversion-prisma.repo";
import { InventoryBatchPrismaRepo } from "./repos/inventoryBatch-prisma.repo";
import { InventoryBatchService } from "./services/inventoryBatch.service";
import { RecipeService } from "./services/recipe.service";
import { RecipePrismaRepo } from "./repos/recipe-prisma.repo";
import { ImportInvoiceService } from "./services/importInvoice.service";
import { ImportInvoicePrismaRepo } from "./repos/importInvoice-prisma.repo";
import { ImportInvoiceDetailService } from "./services/importInvoiceDetail.service";
import { ImportInvoiceDetailPrismaRepo } from "./repos/importInvoiceDetail-prisma.repo";
import { PurchaseProposalService } from "./services/purchaseProposal.service";
import { PurchaseProposalPrismaRepo } from "./repos/purchaseProposal-prisma.repo";
import { PurchaseProposalDetailService } from "./services/purchaseProposalDetail.service";
import { PurchaseProposalDetailPrismaRepo } from "./repos/purchaseProposalDetail-prisma.repo";
import { StockCheckService } from "./services/stockCheck.service";
import { StockCheckPrismaRepo } from "./repos/stockCheck-prisma.repo";
import { StockCheckDetailService } from "./services/stockCheckDetail.service";
import { StockCheckDetailPrismaRepo } from "./repos/stockCheckDetail-prisma.repo";
import { ShareModule } from "src/share/module";
import { SupplierHttpController, SupplierRpcController } from "./controller/supplier-http.controller";
import { IngredientHttpController, IngredientRpcController } from "./controller/ingredient-http.controller";
import { UnitConversionHttpController, UnitConversionRpcController } from "./controller/unitConversion-http.controller";
import { InventoryBatchHttpController, InventoryBatchRpcController } from "./controller/inventoryBatch-http.controller";
import { RecipeHttpController, RecipeRpcController } from "./controller/recipe-http.controller";
import { ImportInvoiceHttpController, ImportInvoiceRpcController } from "./controller/importInvoice-http.controller";
import { ImportInvoiceDetailHttpController, ImportInvoiceDetailRpcController } from "./controller/importInvoiceDetail-http.controller";
import { PurchaseProposalHttpController, PurchaseProposalRpcController } from "./controller/purchaseProposal-http.controller";
import { PurchaseProposalDetailHttpController, PurchaseProposalDetailRpcController } from "./controller/purchaseProposalDetail-http.controller";
import { StockCheckHttpController, StockCheckRpcController } from "./controller/stockCheck-http.controller";
import { StockCheckDetailHttpController, StockCheckDetailRpcController } from "./controller/stockCheckDetail-http.controller";

const dependencies: Provider[] = [
    // Supplier
    { provide: SUPPLIER_SERVICE, useClass: SupplierService},
    { provide: SUPPLIER_REPOSITORY, useClass: SupplierPrismaRepo},

    // Ingredient
    { provide: INGREDIENT_SERVICE, useClass: IngredientService},
    { provide: INGREDIENT_REPOSITORY, useClass: IngredientPrismaRepo},

    // Unit Conversion
    { provide: UNITCONVERSION_SERVICE, useClass: UnitConversionService},
    { provide: UNITCONVERSION_REPOSITORY, useClass: UnitConversionPrismaRepo},

    // Inventory Batch
    { provide: INVENTORYBATCH_SERVICE, useClass: InventoryBatchService},
    { provide: INVENTORYBATCH_REPOSITORY, useClass: InventoryBatchPrismaRepo},

    // Recipe
    { provide: RECIPE_SERVICE, useClass: RecipeService},
    { provide: RECIPE_REPOSITORY, useClass: RecipePrismaRepo},

    // Import Invoice
    { provide: IMPORTINVOICE_SERVICE, useClass: ImportInvoiceService},
    { provide: IMPORTINVOICE_REPOSITORY, useClass: ImportInvoicePrismaRepo},

    // Import Invoice Detail
    { provide: IMPORTINVOICEDETAIL_SERVICE, useClass: ImportInvoiceDetailService},
    { provide: IMPORTINVOICEDETAIL_REPOSITORY, useClass: ImportInvoiceDetailPrismaRepo},

    // Purchase Proposal
    { provide: PURCHASEPROPOSAL_SERVICE, useClass: PurchaseProposalService},
    { provide: PURCHASEPROPOSAL_REPOSITORY, useClass: PurchaseProposalPrismaRepo},

    // Purchase Proposal Detail
    { provide: PURCHASEPROPOSALDETAIL_SERVICE, useClass: PurchaseProposalDetailService},
    { provide: PURCHASEPROPOSALDETAIL_REPOSITORY, useClass: PurchaseProposalDetailPrismaRepo},

    // Stock Check
    { provide: STOCKCHECK_SERVICE, useClass: StockCheckService},
    { provide: STOCKCHECK_REPOSITORY, useClass: StockCheckPrismaRepo },

    // Stock Check Detail
    { provide: STOCKCHECKDETAIL_SERVICE, useClass: StockCheckDetailService},
    { provide: STOCKCHECKDETAIL_REPOSITORY, useClass: StockCheckDetailPrismaRepo },
]

@Module({
    imports: [ShareModule],
    controllers: [
        // Supplier
        SupplierHttpController,
        SupplierRpcController,

        // Ingredient
        IngredientHttpController,
        IngredientRpcController,

        // Unit Conversion
        UnitConversionHttpController,
        UnitConversionRpcController,

        // Inventory Batch
        InventoryBatchHttpController,
        InventoryBatchRpcController,

        // Recipe
        RecipeHttpController,
        RecipeRpcController,

        // Import Invoice
        ImportInvoiceHttpController,
        ImportInvoiceRpcController,

        // Import Invoice Detail
        ImportInvoiceDetailHttpController,
        ImportInvoiceDetailRpcController,

        // Purchase Proposal
        PurchaseProposalHttpController,
        PurchaseProposalRpcController,

        // Purchase Proposal Detail
        PurchaseProposalDetailHttpController,
        PurchaseProposalDetailRpcController,

        // Stock Check
        StockCheckHttpController,
        StockCheckRpcController,

        // Stock Check Detail
        StockCheckDetailHttpController,
        StockCheckDetailRpcController,
    ],
    providers: [...dependencies],
})

export class InventoryModule {}