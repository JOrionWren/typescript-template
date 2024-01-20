import { CONSTANTS } from "constants/Constants";

export const MoneyManagerCfg = {
    // Expressed as a percent of your total money. 30 is 30% of your total money.
    ReserveMoney: 30,
    // Can the reserve money be accessed by scripts?
    ReserveMoneyOffLimits: false,
    // If reserve money can be accessed I.E. ReserveMoneyOffLimits = false, then what is the highest priority that can access it?
    ReserveMoneyPriorityLimit: CONSTANTS.PRIORITY.HIGH,
    //Name of the script for other scripts to identify money manager through DNS
    Name: "MoneyManager"
}