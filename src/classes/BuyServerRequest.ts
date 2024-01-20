import { JCPCompliant } from "classes/wrapped/JCPCompliant";

export class BuyServerRequest extends JCPCompliant{
    constructor(){
        super()
    }

    static FromJson(str: string) : BuyServerRequest{
        return JSON.parse(str);
    }
}