import http from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");
const PUBLIC = join(__dirname, "public");

const PORT = 3000;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32ToBuffer(secret) {

    secret = secret
        .toUpperCase()
        .replace(/\s/g, "")
        .replace(/=/g, "");

    let bits = "";

    for (const char of secret) {

        const value = alphabet.indexOf(char);

        if (value === -1) {
            throw new Error("Secret Base32 invalide");
        }

        bits += value
            .toString(2)
            .padStart(5, "0");
    }

    const bytes = [];

    for (let i = 0; i + 8 <= bits.length; i += 8) {

        bytes.push(
            parseInt(bits.slice(i, i + 8), 2)
        );
    }

    return Buffer.from(bytes);
}

function generateTOTP(secret) {

    const key = base32ToBuffer(secret);

    const counter = Math.floor(
        Date.now() / 1000 / 30
    );

    const counterBuffer = Buffer.alloc(8);

    counterBuffer.writeBigUInt64BE(
        BigInt(counter)
    );

    const hmac = crypto
        .createHmac("sha1", key)
        .update(counterBuffer)
        .digest();

    const offset =
        hmac[hmac.length - 1] & 0x0f;

    const number =
        (
            ((hmac[offset] & 0x7f) << 24) |
            (hmac[offset + 1] << 16) |
            (hmac[offset + 2] << 8) |
            hmac[offset + 3]
        ) >>> 0;

    return (number % 1000000)
        .toString()
        .padStart(6, "0");
}

function sendJSON(res, status, data) {

    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });

    res.end(JSON.stringify(data));
}

function readBody(req) {

    return new Promise((resolve, reject) => {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            resolve(body);
        });

        req.on("error", reject);
    });
}

function getContentType(path) {

    const extension = extname(path);

    if (extension === ".html")
        return "text/html; charset=utf-8";

    if (extension === ".css")
        return "text/css; charset=utf-8";

    if (extension === ".js")
        return "text/javascript; charset=utf-8";

    return "application/octet-stream";
}

function getSafePath(urlPath) {

    // Protección contra path traversal
    const path = decodeURIComponent(
        new URL(urlPath, "http://localhost").pathname
    );

    const file = path === "/"
        ? "index.html"
        : path.slice(1);

    const resolved = join(PUBLIC, file);

    if (!resolved.startsWith(PUBLIC + "/")) {
        throw new Error("Invalid file path");
    }

    return resolved;
}

const server = http.createServer(async (req, res) => {

    try {

        if (
            req.method === "POST" &&
            req.url === "/api/totp"
        ) {

            const body = await readBody(req);
            const data = JSON.parse(body);

            const secret = String(
                data.secret || ""
            ).trim();

            if (!secret) {
                return sendJSON(res, 400, {
                    error: "Secret requis"
                });
            }

            const code = generateTOTP(secret);

            const seconds =
                Math.floor(Date.now() / 1000);

            const expiresIn =
                30 - (seconds % 30);

            return sendJSON(res, 200, {
                code,
                expiresIn
            });
        }

        if (req.method !== "GET") {
            res.writeHead(405);
            return res.end("Method Not Allowed");
        }

        const filePath = getSafePath(req.url);
        const file = await readFile(filePath);

        res.writeHead(200, {
            "Content-Type":
                getContentType(filePath)
        });

        res.end(file);

    } catch (error) {

        console.error(error);

        sendJSON(res, 400, {
            error: error.message
        });
    }
});

server.listen(PORT, () => {
    console.log(
        `TOTP App : http://localhost:${PORT}`
    );
});