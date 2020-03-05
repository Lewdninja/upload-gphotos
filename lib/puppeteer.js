"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const puppeteer_extra_1 = require("puppeteer-extra");
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const puppeteer = puppeteer_extra_1.addExtra(puppeteer_core_1.default);
exports.puppeteer = puppeteer;
puppeteer.use(puppeteer_extra_plugin_stealth_1.default());
