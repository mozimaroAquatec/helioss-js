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
const express_1 = __importDefault(require("express"));
const connect_db_1 = __importDefault(require("./config/connect.db")); // Importing MongoDB connection function
const cors_1 = __importDefault(require("cors"));
require("./config/env.config");
const page_not_found_1 = __importDefault(require("./middlewares/page.not.found"));
const logging_1 = require("./logging");
//Helioss/Energie
const mqtt_services_1 = require("./services/mqtt.services");
const heliossServices = __importStar(require("./services/helioss.services"));
const helioss_routes_1 = __importDefault(require("./routes/helioss.routes"));
// Creating an Express app
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: false }));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Connecting to MongoDB
(0, connect_db_1.default)();
// Connecting to Mqtt server
(0, mqtt_services_1.mqttConeect)();
heliossServices.updateHeliossByMqtt("Helioss/Energie");
heliossServices.updateHeliossByMqtt("Helioss/Filtration");
heliossServices.geolocationSubAnPubByMqtt("Helioss/Geolocation");
heliossServices.geolocationSubAnPubByMqtt("Helioss/Temperature");
heliossServices.geolocationSubAnPubByMqtt("Helioss/Cloud");
app.use("/", helioss_routes_1.default);
app.use("*", page_not_found_1.default);
// Starting the server and listening on the specified port
app.listen(process.env.PORT, () => {
    logging_1.serverLogger.info(`Server is running on port ${process.env.PORT}`);
});
//# sourceMappingURL=index.js.map