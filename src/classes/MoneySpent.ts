import { MoneyRequest } from "classes/MoneyRequest";
import { JCPCompliant } from "classes/wrapped/JCPCompliant";

export class MoneySpent extends JCPCompliant{
    Request : MoneyRequest
    constructor(request: MoneyRequest){
        super()
        this.Request = request;
    }

    static FromJson(str: string) : MoneySpent{
        return JSON.parse(str);
    }
}