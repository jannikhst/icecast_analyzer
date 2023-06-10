"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
// ---------- Settings ----------
const BPM_MEDIAN_COUNT = 8;
const RMS_MEDIAN_COUNT = 3;
// ------------------------------
const app = (0, express_1.default)();
app.use(express_1.default.json());
const host = (_a = process.env.PIPONG_HOST) !== null && _a !== void 0 ? _a : 'http://192.168.178.149:8000';
const path = (_b = process.env.PIPONG_PATH) !== null && _b !== void 0 ? _b : '/wait';
const API_URL = host + '/' + path;
const receivedData = [];
app.post('/data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    receivedData.push(data);
    if (receivedData.length > 50) {
        receivedData.shift();
    }
    yield handle();
    res.send('ok');
}));
let highestRMS = 0;
function handle() {
    return __awaiter(this, void 0, void 0, function* () {
        const lastBPMs = receivedData.slice(-BPM_MEDIAN_COUNT).map(d => d.bpm);
        const medianBpm = median(lastBPMs);
        const lastRMSs = receivedData.slice(-RMS_MEDIAN_COUNT).map(d => d.rms);
        const medianRms = Math.min(median(lastRMSs), 1);
        highestRMS = Math.max(highestRMS, medianRms);
        const normalizedRms = medianRms / highestRMS;
        const out = {
            ms: (60000 / medianBpm),
            rms: normalizedRms,
        };
        yield push(out);
    });
}
function push(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const json = JSON.stringify(data);
        const headers = {
            'Content-Type': 'application/json',
            'Content-Length': json.length,
            'Accept': '*/*',
        };
        yield axios_1.default.post(API_URL, json, { headers });
    });
}
function median(array) {
    array.sort((a, b) => a - b);
    const half = Math.floor(array.length / 2);
    if (array.length % 2) {
        return array[half];
    }
    return (array[half - 1] + array[half]) / 2.0;
}
//# sourceMappingURL=bridge.js.map