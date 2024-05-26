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
exports.geolocationSubAnPubByMqtt = exports.updateHeliossByMqtt = exports.existYear = exports.updateFiltrationsbyDate = exports.updateEnergiesByDateAndTime = exports.createAllDatesAndHoursOfYear = void 0;
const logger = __importStar(require("../logging/index"));
const helioss_model_1 = __importDefault(require("../models/helioss.model"));
const datetime_1 = __importDefault(require("../utils/datetime"));
const error_handler_1 = __importDefault(require("../utils/error.handler"));
const mqtt_services_1 = __importStar(require("./mqtt.services"));
const weathermapServices = __importStar(require("./weathermap.services"));
// Initialize MQTT client
const mqttClient = (0, mqtt_services_1.default)();
/**
 * @desc Generates helioss records for all dates and hours of a given year.
 *
 * @param {number} year - The year for which to generate helioss records.
 * @returns {Promise<void>} - A promise that resolves once all helioss records are created.
 * @throws {ErrorResponse} - If there's an error while creating helioss records.
 */
const createAllDatesAndHoursOfYear = async (year) => {
    try {
        const helioss = []; // Array to store helioss records
        // Loop through each month of the year
        for (let month = 0; month < 12; month++) {
            const startDate = new Date(year, month, 1); // First day of the current month
            const endDate = new Date(year, month + 1, 0); // Last day of the current month
            // Loop through each day of the current month
            for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
                const day = currentDate.getDate();
                const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
                const date = `${year}/${currentMonth}/${day}`;
                // Log the date
                logger.consoleLogger?.info(`date: ${year}/${currentMonth}/${day}`);
                // Log the hours from 0 to 23 for the current date
                for (let hour = 0; hour < 24; hour++) {
                    const formattedHour = hour < 10 ? "0" + hour : hour;
                    // Log the hour
                    logger.consoleLogger?.info(` hour : ${formattedHour}`);
                    // Add record to the helioss array
                    helioss.push({
                        year,
                        month: currentMonth,
                        date,
                        time: formattedHour,
                    });
                }
                // Add a separator for the next day
                logger.consoleLogger?.info(`\nnext day\n`);
            }
        }
        // Insert helioss records into the database
        try {
            await helioss_model_1.default.insertMany(helioss);
            logger.heliossLogger.info(`inserted Helioss records for year: ${year} to the database success `);
        }
        catch (error) {
            logger.heliossLogger.error(error, `inserted Helioss records for year: ${year} error`);
            throw new error_handler_1.default("fail", `inserted Helioss records for year: ${year} error :${error} `);
        }
    }
    catch (error) {
        // Log and handle other errors
        logger.heliossLogger.error(error, "createAllDatesAndHoursOfYear error");
        throw new error_handler_1.default("fail", `createAllDatesAndHoursOfYear: ${error}`);
    }
};
exports.createAllDatesAndHoursOfYear = createAllDatesAndHoursOfYear;
/**
 * @desc Update Helioss by ID
 * @param message - The message containing energy data
 * @returns {Promise<void>}
 */
const updateEnergiesByDateAndTime = async function (message) {
    try {
        // Get the current date and time
        const currentDate = (0, datetime_1.default)();
        // Format the date as "YYYY/M/D"
        const date = `${currentDate.currentYear}/${currentDate.currentMonth}/${currentDate.currentDay}`;
        const time = `${currentDate.currentHour}`;
        // Extract Filtrations data from the message
        // let energie = message.toString().slice(0, 9);
        // if (energie[energie.length - 1] === ".") {
        //   energie = energie.slice(0, energie.length - 2);
        // }
        const energie = message.toString();
        try {
            // Update the Filtrations collection in MongoDB
            await helioss_model_1.default.updateOne({ $and: [{ time }, { date }] }, // Filter criteria
            {
                energie,
                message,
            } // Update data
            );
            logger.heliossLogger.info({ energie, message, date, time }, `update the energie to ${energie} in date: ${date} and time: ${time} in success`);
        }
        catch (error) {
            // Handle MongoDB update error
            logger.heliossLogger.error(error, "Error update energies to MongoDB");
            throw new error_handler_1.default("fail", `updateEnergie error: ${error}`);
        }
    }
    catch (error) {
        logger.heliossLogger.error(error, "Error updateEnergies controller");
        // Handle other errors
        throw new error_handler_1.default("fail", `updateEnergies controller error: ${error}`);
    }
};
exports.updateEnergiesByDateAndTime = updateEnergiesByDateAndTime;
/**
 * @desc Updates filtration records for the current date and time based on received message.
 *
 * @param {string} message - The message containing filtration data.
 * @returns {Promise<void>} - A promise that resolves once the filtration records are updated.
 * @throws {ErrorResponse} - If there's an error while updating filtration records.
 */
const updateFiltrationsbyDate = async function (message) {
    try {
        // Get the current date and time
        const currentDate = (0, datetime_1.default)();
        // Format the date and time
        const date = `${currentDate.currentYear}/${currentDate.currentMonth}/${currentDate.currentDay}`;
        const time = `${currentDate.currentHour}`;
        // Extract filtration data from the message
        const filtration = message.toString();
        try {
            // Update the Filtrations collection in MongoDB
            await helioss_model_1.default.updateMany({ date }, // Filter criteria
            {
                filtration,
                message,
                last: true,
            } // Update data
            );
            // Log successful update
            logger.heliossLogger.info({ filtration, message, date, time }, `Updated filtrations to ${filtration} on date: ${date} and time: ${time}`);
        }
        catch (error) {
            // Handle MongoDB update error
            logger.heliossLogger.error(error, "Error updating filtrations by date");
            throw new error_handler_1.default("fail", `updateFiltrations error: ${error}`);
        }
    }
    catch (error) {
        // Log and handle other errors
        logger.heliossLogger.error(error, "Error in updateFiltrations controller");
        throw new error_handler_1.default("fail", `updateFiltrations controller error: ${error}`);
    }
};
exports.updateFiltrationsbyDate = updateFiltrationsbyDate;
/**
 * @desc Checks if helioss records exist for a given year.
 *
 * @param {number} year - The year for which to check if records exist.
 * @returns {Promise<boolean>} - A promise that resolves with a boolean indicating whether records exist for the specified year.
 * @throws {ErrorResponse} - If there's an error while checking for existing records.
 */
const existYear = async (year) => {
    try {
        // Attempt to find energy records for the specified year
        const existYear = await helioss_model_1.default.findOne({ year });
        // If records exist for the year, return true; otherwise, return false
        if (existYear)
            return true;
        else
            return false;
    }
    catch (error) {
        // Log the error
        logger.heliossLogger.error(error, "existYear error");
        // Throw an error response with details of the error
        throw new error_handler_1.default("fail", `existYear: ${error}`);
    }
};
exports.existYear = existYear;
/**
 *@desc  Subscribes to an MQTT topic and updates Helioss records based on received messages.
 *
 * @param {string} topic - The MQTT topic to subscribe to.
 * @returns {Promise<void>} - A promise that resolves once the function completes its task.
 * @throws {ErrorResponse} - If there's an error while updating Helioss records.
 */
const updateHeliossByMqtt = async (topic) => {
    // Subscribe to the specified MQTT topic
    (0, mqtt_services_1.mqttSubscribe)(topic);
    // Event handler for receiving MQTT messages
    mqttClient.on("message", async (topic, message) => {
        // Process messages based on topic
        switch (topic) {
            case "Helioss/Energie": {
                // Log the received message
                logger.mqttLogger.info({ topic, message: message.toString() }, `Received message from topic: ${topic} and the message is: ${message.toString()}`);
                try {
                    // Update energy records based on the received message
                    await (0, exports.updateEnergiesByDateAndTime)(message.toString());
                }
                catch (error) {
                    // Log and throw an error if updating energy records fails
                    logger.heliossLogger.error(error, "Update energy error caught in controller");
                    throw new error_handler_1.default("fail", `Update energies error: ${error}`);
                }
                break;
            }
            case "Helioss/Filtration": {
                // Log the received message
                logger.mqttLogger.info({ topic, message: message.toString() }, `Received message from topic: ${topic} and the message is: ${message.toString()}`);
                try {
                    // Update filtration records based on the received message
                    await (0, exports.updateFiltrationsbyDate)(message.toString());
                }
                catch (error) {
                    // Log and throw an error if updating filtration records fails
                    logger.heliossLogger.error(error, "Update filtrations error caught in controller");
                    throw new error_handler_1.default("fail", `Update filtrations error: ${error}`);
                }
                break;
            }
        }
    });
};
exports.updateHeliossByMqtt = updateHeliossByMqtt;
/**
 * @desc This function subscribes to an MQTT topic and handles incoming messages for geolocation data.
 * It retrieves geolocation information such as latitude and longitude from received messages,
 * and performs actions based on the topic.
 * @param {string} topic - The MQTT topic to subscribe to.
 */
const geolocationSubAnPubByMqtt = async (topic) => {
    // Subscribe to the specified MQTT topic
    (0, mqtt_services_1.mqttSubscribe)(topic);
    // Ensure no duplicate listeners
    mqttClient.removeAllListeners("message");
    // Event handler for receiving MQTT messages
    mqttClient.on("message", async (receivedTopic, message) => {
        const messageStr = message.toString();
        const [longitude, latitude] = messageStr.split(":");
        switch (receivedTopic) {
            case "Helioss/Geolocation": {
                const currrendDate = (0, datetime_1.default)().currentDateWithMs.toString();
                logger.consoleLogger?.info({ currrendDate }, "current date with ms");
                logger.mqttLogger.info({ topic: receivedTopic, message: messageStr }, `received message from topic : ${receivedTopic} and the message is :${messageStr}`);
                logger.consoleLogger?.info({ latitude, longitude }, `latitude: ${latitude} and longitude : ${longitude}`);
                (0, mqtt_services_1.mqttPublish)("Geolocation/CurentDate", Buffer.from(currrendDate));
                break;
            }
            case "Helioss/Cloud": {
                logger.mqttLogger.info({ topic: receivedTopic, message }, `Received message from topic : ${receivedTopic} and the message is :${messageStr}`);
                try {
                    logger.consoleLogger?.info(`Fetching cloud cover for latitude: ${latitude}, longitude: ${longitude}`);
                    const cloud = await weathermapServices.getNextDayCloudCover(latitude, longitude);
                    logger.consoleLogger?.info({ cloud }, `Cloud cover data: ${cloud}`);
                    (0, mqtt_services_1.mqttPublish)("Geolocation/Cloud", Buffer.from(cloud.toString()));
                }
                catch (error) {
                    logger.consoleLogger?.error({ error }, `Error fetching cloud cover data: ${error}`);
                    throw new error_handler_1.default("fail", `getNextDayCloudCover : ${error}`);
                }
                break;
            }
            case "Helioss/Temperature": {
                logger.mqttLogger.info({ topic: receivedTopic, message }, `received message from topic : ${receivedTopic} and the message is :${messageStr}`);
                try {
                    const temperature = await weathermapServices.getTodayTemperature(latitude, longitude);
                    (0, mqtt_services_1.mqttPublish)("Geolocation/Temperature", Buffer.from(temperature.toString()));
                }
                catch (error) {
                    throw new error_handler_1.default("fail", `getTodayTemperature : ${error}`);
                }
                break;
            }
        }
    });
};
exports.geolocationSubAnPubByMqtt = geolocationSubAnPubByMqtt;
//# sourceMappingURL=helioss.services.js.map