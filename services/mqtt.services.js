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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mqttMessage = exports.mqttPublish = exports.mqttSubscribe = exports.mqttConeect = void 0;
const mqtt = __importStar(require("mqtt")); // Importing MQTT library
const logging_1 = require("../logging");
let mqttClient = null; // Initialize MQTT client as null
// Function to initialize and return MQTT client
const initializeMqttClient = () => {
    // If MQTT client exists, disconnect and clear it
    if (mqttClient) {
        mqttClient.end();
        mqttClient = null;
    }
    // Constructing the MQTT connection URL using environment variables
    const connectUrl = `${process.env.MQTT_PROTOCOL || "mqtt"}://${process.env.MQTT_HOST || "mqtt.livepool.eu"}:${process.env.MQTT_PORT || "8883"}`;
    // Create and return MQTT client
    mqttClient = mqtt.connect(connectUrl, {
        clientId: `mqtt_${Math.random().toString(16).slice(3)}`, // Generating a random client ID
        clean: true,
        connectTimeout: 4000,
        username: process.env.MQTT_USERNAME || "aquatec", // MQTT username
        password: process.env.MQTT_PASSWORD || "iot2021", // MQTT password
        reconnectPeriod: 1000,
    });
    return mqttClient;
};
const mqttConeect = async () => {
    mqttClient?.on("connect", () => {
        logging_1.mqttLogger.info("connected to MQTT broker");
    });
};
exports.mqttConeect = mqttConeect;
// Event handler for MQTT client when it's connected to the broker
const mqttSubscribe = (topic) => {
    mqttClient?.subscribe(topic);
    logging_1.mqttLogger.info({ topic }, `subscribe to topic : ${topic}`);
};
exports.mqttSubscribe = mqttSubscribe;
const mqttPublish = (topic, message) => {
    mqttClient?.publish(topic, message);
    logging_1.mqttLogger.info({ topic, message }, `publish to topic : ${topic} and the message :${message}`);
};
exports.mqttPublish = mqttPublish;
const mqttMessage = () => {
    let topicMqttt = "";
    let messgaeMqttt = "";
    mqttClient?.on("message", async (topic, message) => {
        topicMqttt = topic;
        messgaeMqttt = message.toString();
        logging_1.consoleLogger?.info({ topic, message }, `the topic is ${topic} and the message is ${message.toString()}`);
    });
    return { topic: topicMqttt, message: messgaeMqttt };
};
exports.mqttMessage = mqttMessage;
exports.default = initializeMqttClient;
//# sourceMappingURL=mqtt.services.js.map