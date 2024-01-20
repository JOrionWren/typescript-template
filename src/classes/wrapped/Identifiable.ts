import { IIdentifiable } from "interfaces/IIdentifiable";

export class Identifiable implements IIdentifiable{
    IsType: string;
    constructor(){
        this.IsType = this.constructor.name;
    }
}