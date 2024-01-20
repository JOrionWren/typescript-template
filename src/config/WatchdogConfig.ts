import { CONSTANTS } from "constants/Constants";
import { WatchDogConfig } from "interfaces/WatchDogConfig";
import { ScriptConfig } from "interfaces/ScriptConfig";

const Priority = CONSTANTS.PRIORITY;

export const WatchDogcfg: WatchDogConfig = {
    Scripts: new Map<string, ScriptConfig>([
        [
            "DNS",
            {
                Priority: Priority.HIGHEST,
                ScriptName: "DNS",
                ScriptLocation: "/scripts/",
                ScriptArgs: null,
                MaxThreadsAllowed: 1,
            }
        ],
        [
            "MoneyManager",
            {
                Priority: Priority.HIGHEST, // Set the priority as needed
                ScriptName: "MoneyManager",
                ScriptLocation: "/scripts/", // Update the location if different
                ScriptArgs: null, // Replace with actual arguments if any
                MaxThreadsAllowed: 1, // Set the max threads as needed
            }
        ],
    ]),
    WaitTimeSeconds: 3,
};