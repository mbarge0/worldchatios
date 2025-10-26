"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = exports.OPENAI_MODEL = exports.OPENAI_API_KEY = exports.auth = exports.fv = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const openai_1 = __importDefault(require("openai"));
if (!(0, app_1.getApps)().length)
    (0, app_1.initializeApp)();
exports.db = (0, firestore_1.getFirestore)();
exports.fv = firestore_1.FieldValue;
exports.auth = (0, auth_1.getAuth)();
exports.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
exports.OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
exports.openai = new openai_1.default({ apiKey: exports.OPENAI_API_KEY });
