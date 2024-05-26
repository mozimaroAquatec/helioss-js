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
exports.resetHeliossById = exports.getLastFiltration = exports.getHeliossByDate = exports.getHeliossByDateAndTime = exports.getHeliossByYear = exports.getHelioss = exports.insertHeliossOfYear = void 0;
// Importing necessary modules
const error_handler_1 = __importDefault(require("../utils/error.handler")); // Importing custom error handler
const year_validation_1 = require("../utils/year-validation");
const helioss_schemas_1 = require("../utils/schemas/helioss.schemas");
const success_response_1 = require("../utils/success.response");
const logging_1 = require("../logging");
const heliossServices = __importStar(require("../services/helioss.services"));
const helioss_model_1 = __importDefault(require("../models/helioss.model"));
/**
 * @desc inserts filtrations  records for all dates and hours of a given year into the database.
 * @param POST
 * @access PUBLIC
 */
const insertHeliossOfYear = async function (req, res) {
    try {
        let { year } = req.body;
        // Validating input data from client
        const { error } = (0, helioss_schemas_1.yearSchema)(req.body);
        if (error)
            return res
                .status(400)
                .json(new error_handler_1.default("fail", `${error.details[0].message}`));
        if (typeof year === "string") {
            year = parseInt(year);
        }
        const checkYear = (0, year_validation_1.isValidYear)(year);
        if (!checkYear)
            return res.status(400).json(new error_handler_1.default("fail", "invalid year"));
        const existYear = await heliossServices.existYear(year);
        if (existYear)
            return res
                .status(400)
                .json(new error_handler_1.default("fail", "year already exist"));
        // Generate filtrations records for the specified year
        await heliossServices.createAllDatesAndHoursOfYear(year);
        return res
            .status(201)
            .json(new success_response_1.SuccessResponse(201, `inserted Helioss records for year: ${year} to database success`));
    }
    catch (error) {
        // Handle errors
        res.status(500).json(new error_handler_1.default("fail", "Internal server error"));
        logging_1.heliossLogger.error(error, "helioss of all year insert rejected error");
        throw new error_handler_1.default("fail", `insertHeliossOfYear error: ${error}`);
    }
};
exports.insertHeliossOfYear = insertHeliossOfYear;
/**
 * @desc Get helioss from the database
 * @method GET /
 *
 * @access PUBLIC
 **/
const getHelioss = async (req, res) => {
    try {
        const helioss = await helioss_model_1.default.find().select("-message -year -updatedAt -createdAt -last -month");
        logging_1.heliossLogger.info({ method: "GET" }, `get helioss success`);
        // Return success response with Energies data
        return res.status(200).json(helioss);
    }
    catch (error) {
        // Handle errors
        res.status(500).json(new error_handler_1.default("fail", "Internal server error"));
        throw new error_handler_1.default("fail", `getEnergies error : ${error}`);
    }
};
exports.getHelioss = getHelioss;
/**
 * @desc Get helioss from the database by year
 * @method GET /helioss/:year
 * @param {number} year - The year for which to retrieve helioss
 * @access PUBLIC
 **/
const getHeliossByYear = async (req, res) => {
    try {
        let { year } = req.query;
        // Validating input data from client
        const { error } = (0, helioss_schemas_1.yearSchema)(req.query);
        if (error)
            return res
                .status(400)
                .json(new error_handler_1.default("fail", `${error.details[0].message}`));
        const checkYear = (0, year_validation_1.isValidYear)(parseInt(year));
        if (!checkYear)
            return res.status(400).json(new error_handler_1.default("fail", "invalid year"));
        // Query the database for all Energies records
        const helioss = await helioss_model_1.default.find({ year }).select("-message -year -updatedAt -createdAt -last -month");
        logging_1.heliossLogger.info({ year, method: "GET" }, `get helioss of year : ${year} success`);
        // Return success response with Energies data
        return res.status(200).json(helioss);
    }
    catch (error) {
        // Handle errors
        res.status(500).json(new error_handler_1.default("fail", "Internal server error"));
        throw new error_handler_1.default("fail", `getEnergies error : ${error}`);
    }
};
exports.getHeliossByYear = getHeliossByYear;
/**
 * @desc  Controller function to get helioss by date and time
 * @method GET /date-time/
 * @param PUBLIC
 **/
const getHeliossByDateAndTime = async function (req, res) {
    try {
        let { date, time } = req.query;
        // Validating input data from client
        const { error } = (0, helioss_schemas_1.dateAndTimeSchema)(req.query);
        if (error)
            return res
                .status(400)
                .json(new error_handler_1.default("fail", `${error.details[0].message}`));
        // Query the database for all Energies records
        const helioss = await helioss_model_1.default.findOne({
            $and: [{ time }, { date }],
        }).select("-message -year -month -updatedAt -createdAt -last");
        logging_1.heliossLogger.info({ method: "GET", date, time }, `get helioss by date : ${date} and time ${time}`);
        // Return success response with Energies data
        return res.status(200).json(helioss);
    }
    catch (error) {
        // Handle errors
        logging_1.heliossLogger.error(error, "get helioss by date and time error");
        res.status(500).json(new error_handler_1.default("fail", "Internal server error"));
        throw new error_handler_1.default("fail", `getHeliossByDateAndTime error : ${error}`);
    }
};
exports.getHeliossByDateAndTime = getHeliossByDateAndTime;
/**
 * @desc  Controller function to get helioss by date and time
 * @method GET /date-time/
 * @param PUBLIC
 **/
const getHeliossByDate = async function (req, res) {
    try {
        let { date } = req.query;
        // Validating input data from client
        const { error } = (0, helioss_schemas_1.dateSchema)(req.query);
        if (error)
            return res
                .status(400)
                .json(new error_handler_1.default("fail", `${error.details[0].message}`));
        // Query the database for all Energies records
        const helioss = await helioss_model_1.default.find({ date }).select("-message -year -month -updatedAt -createdAt -last");
        logging_1.heliossLogger.info({ method: "GET", date }, `get helioss by date : ${date} success`);
        // Return success response with Energies data
        return res.status(200).json(helioss);
    }
    catch (error) {
        // Handle errors
        logging_1.heliossLogger.error(error, "get helioss by date and time error");
        res.status(500).json(new error_handler_1.default("fail", "Internal server error"));
        throw new error_handler_1.default("fail", `getEnergies error : ${error}`);
    }
};
exports.getHeliossByDate = getHeliossByDate;
/**
 * @desc  Controller function to get helioss by date and time
 * @method GET /date-time/
 * @param PUBLIC
 **/
const getLastFiltration = async function (req, res) {
    try {
        // Query the database for all Energies records
        const helioss = await helioss_model_1.default.findOne({ last: true }).select("-message -year -month -updatedAt -createdAt -last -time -energie");
        logging_1.heliossLogger.info({ method: "GET" }, `get last filtration : ${helioss?.filtration} success`);
        // Return success response with Energies data
        return res.status(200).json(helioss);
    }
    catch (error) {
        // Handle errors
        logging_1.heliossLogger.error(error, "get last filtration error");
        res.status(500).json(new error_handler_1.default("fail", "Internal server error"));
        throw new error_handler_1.default("fail", `getLastFiltration error : ${error}`);
    }
};
exports.getLastFiltration = getLastFiltration;
/**
 *
 * @desc reset helioss by id
 * @method PUT /:id
 * @access PUBLIC
 **/
const resetHeliossById = async function (req, res) {
    try {
        await helioss_model_1.default.findByIdAndUpdate(req.params.id, {
            message: "00.00:000.00:00:00",
            filtration: "00.00:000.00:00:00",
            energie: "00.00:000",
        });
        logging_1.heliossLogger.info("reset helioss by id success");
        return res
            .status(200)
            .json(new success_response_1.SuccessResponse(200, "reset helioss by id success"));
    }
    catch (error) {
        // Handle errors
        res.status(500).json(new error_handler_1.default("fail", "Internal server error"));
        logging_1.heliossLogger.error(error, "reset helioss by id errorr");
        throw new error_handler_1.default("fail", `resetHeliossById error : ${error}`);
    }
};
exports.resetHeliossById = resetHeliossById;
//# sourceMappingURL=helioss.controllers.js.map