"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextDayCloudCover = exports.getTodayTemperature = void 0;
const logger = __importStar(require("./../logging/index"));
const axios_1 = __importDefault(require("axios"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const error_handler_1 = __importDefault(require("../utils/error.handler"));
const latitude = "10.266754";
const longitude = "36.797";
const apiKey = process.env.OPENWEATHERMAP_API_KEY;
/**
 * @desc Retrieves today's temperature forecast from the OpenWeatherMap API.
 * @returns {Promise<number>} - A promise that resolves with the average temperature for today.
 * @throws {ErrorResponse} - If there's an error with the API request or if no forecast data is available for today.
 */
const getTodayTemperature = async (latitude, longitude) => {
    try {
        // Make an API call to get weather forecast data
        const response = await axios_1.default.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
        const forecastList = response.data.list;
        // Define the start and end of the current day in GMT+1 timezone
        const todayStart = (0, moment_timezone_1.default)().tz("Europe/Paris").startOf("day"); // 00:00 of the current day
        const todayEnd = (0, moment_timezone_1.default)(todayStart).endOf("day"); // 23:59:59 of the current day
        // Filter forecasts to include only those for the current day
        const todayForecasts = forecastList.filter((item) => {
            const forecastTime = moment_timezone_1.default.unix(item.dt).tz("Europe/Paris");
            return forecastTime.isBetween(todayStart, todayEnd, null, "[]");
        });
        // Check if there are forecasts available for the current day
        if (todayForecasts.length > 0) {
            let totalTemperature = 0; // Initialize total temperature variable
            // Iterate through today's forecasts and sum up the temperatures
            todayForecasts.forEach((forecast) => {
                const forecastTime = moment_timezone_1.default
                    .unix(forecast.dt)
                    .tz("Europe/Paris")
                    .format("YYYY-MM-DD HH:mm:ss"); // Format the forecast time
                logger.consoleLogger?.info(`Time: ${forecastTime}, Temperature: ${forecast.main.temp}°C`);
                totalTemperature += forecast.main.temp; // Add temperature to the total
            });
            // Calculate the average temperature
            const averageTemperature = totalTemperature / todayForecasts.length;
            // Log the average temperature
            logger.consoleLogger?.info({ averageTemperature }, `The average temperature for today is ${averageTemperature}°C`);
            return averageTemperature; // Return the average temperature
        }
        else {
            // Log and throw an error if no forecast data is available for today
            logger.weatherMapLogger.error("getTodayTemperature error No forecast data available for today (GMT+1)");
            throw new error_handler_1.default("fail", "getTodayTemperature error No forecast data available for today (GMT+1)");
        }
    }
    catch (error) {
        if (error.response) {
            // Log and throw an error if there's an issue with the API request
            logger.weatherMapLogger.error(error.response.data, "getTodayTemperature Error with the request:");
            throw new error_handler_1.default("fail", `getTodayTemperature Error with the request: ${error.response}`);
        }
        else {
            // Log and throw an error if any other error occurs
            logger.weatherMapLogger.error(error.message, "getTodayTemperature error");
            throw new error_handler_1.default("fail", `getTodayTemperature Error: ${error.message}`);
        }
    }
};
exports.getTodayTemperature = getTodayTemperature;
/**
 * @desc Retrieves the cloud cover forecast for the next day from the OpenWeatherMap API.
 *
 * @returns {Promise<number>} - A promise that resolves with the average cloud cover percentage for the next day.
 * @throws {ErrorResponse} - If there's an error with the API request or if no forecast data is available for the next day.
 */
const getNextDayCloudCover = async (latitude, longitude) => {
    try {
        const response = await axios_1.default.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
        const forecastList = response.data.list;
        // Get the start and end of the next day in GMT+1 timezone
        const nextDayStart = (0, moment_timezone_1.default)()
            .tz("Europe/Paris")
            .add(1, "day")
            .startOf("day"); // 00:00 of the next day
        const nextDayEnd = (0, moment_timezone_1.default)(nextDayStart).endOf("day"); // 23:59:59 of the next day
        // Filter forecasts for the next day
        const nextDayForecasts = forecastList.filter((item) => {
            const forecastTime = moment_timezone_1.default.unix(item.dt).tz("Europe/Paris");
            return forecastTime.isBetween(nextDayStart, nextDayEnd, null, "[]");
        });
        if (nextDayForecasts.length > 0) {
            let totalCloudCover = 0;
            nextDayForecasts.forEach((forecast) => {
                logger.consoleLogger?.info(forecast.clouds.all, "forecast.clouds");
                totalCloudCover += forecast.clouds.all;
            });
            const averageCloudCover = totalCloudCover / nextDayForecasts.length;
            logger.weatherMapLogger.info(averageCloudCover, `get The average cloud cover percentage for the next day success`);
            return averageCloudCover;
        }
        else {
            logger.weatherMapLogger.error("No forecast data available for the next day (GMT+1).");
            throw new error_handler_1.default("fail", "No forecast data available for the next day (GMT+1).");
        }
    }
    catch (error) {
        if (error.response) {
            logger.weatherMapLogger.error({ error: error.response.data }, "get cloud of next day error");
            throw new error_handler_1.default("fail", `get cloud of next day error ${error.response.data}`);
        }
        else {
            logger.weatherMapLogger.error({ error: error.message }, "get cloud of next day error");
            throw new error_handler_1.default("fail", `get cloud of next day error ${error.message}`);
        }
    }
};
exports.getNextDayCloudCover = getNextDayCloudCover;
//# sourceMappingURL=weathermap.services.js.map