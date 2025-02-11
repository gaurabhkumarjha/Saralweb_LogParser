const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const useragent = require("useragent");
const router = require("./Routers/routes");

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(router);
app.use(express.json());


// Function to convert UTC to IST
function convertUTCtoIST(utcDate) {
    const date = new Date(utcDate);
    date.setHours(date.getHours() + 5); // Add 5 hours for IST
    date.setMinutes(date.getMinutes() + 30); // Add 30 minutes for IST
    return date.toISOString().replace('T', ' ').replace('Z', ''); // Convert back to string format
}

// Logging Middleware
app.use((req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const timestamp = convertUTCtoIST(new Date().toISOString());
    const method = req.method;
    const url = req.url;
    const httpVersion = `HTTP/${req.httpVersion}`;
    const referrer = req.get("referer") || "-";
    const userAgent = req.get("user-agent") || "-";

    // Parse User-Agent
    const agent = useragent.parse(userAgent);
    const browser = agent.toAgent();
    const os = agent.os.toString();
    const device = agent.device.toString();

    // Simulated Response Size and Status Code
    const statusCode = res.statusCode || 200; // Example status
    const responseSize = Math.floor(Math.random() * 5000) + 500; // Random size (500 - 5000 bytes)

    // Log Format
    const logEntry = `${ip} - - [${timestamp}] "${method} ${url} ${httpVersion}" ${statusCode} ${responseSize} "${referrer}" "${userAgent}" "${browser}" "${os}" "${device}"\n`;

    // Append to log file
    fs.appendFileSync(path.join(__dirname, "server.log"), logEntry);

    next();
});


// Sample route
app.get("/", (req, res) => {
    res.send("Hello! Your request has been logged.");
});

app.listen(8000, () => console.log("Server running on port 8000"));
