import { Injectable } from "@nestjs/common";
import { IPublicRecipeRpc } from "../interface";
import axios from "axios";
import { PublicRecipe } from "../data-model";

@Injectable()
export class RecipeRPCClient implements IPublicRecipeRpc {
    constructor(private readonly recipeServiceUrl: string) {}

    async findById(id: string): Promise<PublicRecipe | null> {
        try {
            const response = await axios.get(`${this.recipeServiceUrl}/rpc/recipes/${id}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }

    async findByIds(ids: string[]): Promise<PublicRecipe[]> {
        try {
            const response = await axios.post(`${this.recipeServiceUrl}/rpc/recipes/list-by-ids`, { ids });
            return response.data;
        } catch (error) {
            return [];
        }
    }
}