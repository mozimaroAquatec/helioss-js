"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_timezone_1 = __importDefault(require("moment-timezone"));
/**
 * @desc Gets the current date and time in GMT+1 (Central European Time).
 * @returns {Object} - An object containing formatted hour, current month, current year, and current day.
 */
const getCurrentDateTime = () => {
    // Get current date and time in GMT+1 (Central European Time)
    const gmtPlus1Time = (0, moment_timezone_1.default)().tz("Etc/GMT-1");
    const currentDate = (0, moment_timezone_1.default)().tz("Etc/GMT-1").format("YYYY/MM/DD HH:mm:ss.SS");
    // Extract hour and format it with leading zero if necessary
    const currentHour = gmtPlus1Time.format("HH");
    const currentDateWithMs = (0, moment_timezone_1.default)().valueOf();
    // Extract current month, year, and day
    const currentMonth = gmtPlus1Time.month() + 1; // months are zero-indexed
    const currentYear = gmtPlus1Time.year();
    const currentDay = gmtPlus1Time.date();
    const date = `${currentYear}/${currentMonth}/${currentDay}`;
    // Return an object containing formatted hour, current month, current year, and current day
    return {
        date,
        currentHour,
        currentMonth,
        currentYear,
        currentDay,
        currentDate,
        currentDateWithMs,
    };
};
exports.default = getCurrentDateTime;
//# sourceMappingURL=datetime.js.map