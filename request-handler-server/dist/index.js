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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = require("aws-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
dotenv_1.default.config();
const s3 = new aws_sdk_1.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
// Configure session middleware
app.use((0, express_session_1.default)({
    secret: "SAVE-ID",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));
app.get("/*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const host = req.path;
    if (host !== "/favicon.ico") {
        let id = req.session.id_cookie;
        console.log(id);
        var filePath = host.slice(1);
        if (!id) {
            const segments = host.split("/");
            id = segments[1];
            req.session.id_cookie = id;
            var filePath = host.slice(id.length + 2);
        }
        console.log(`dist/${id}/${filePath}`);
        const contents = yield s3
            .getObject({
            Bucket: "vercel-code-project",
            Key: `dist/${id}/${filePath}`,
        })
            .promise();
        const type = host.endsWith("html")
            ? "text/html"
            : host.endsWith("css")
                ? "text/css"
                : "application/javascript";
        res.set("Content-Type", type);
        res.send(contents.Body);
        setTimeout(() => {
            req.session.destroy(err => {
                if (err) {
                    console.error("Failed to destroy session:", err);
                }
                else {
                    console.log(`Session destroyed for ID: ${id}`);
                }
            });
        }, 15 * 1000);
    }
}));
app.listen(3001, () => {
    console.log("App is listening on PORT 3001");
});
