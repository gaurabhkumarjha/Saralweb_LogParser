const fs = require("fs");
const path = require("path");

// Path to log file
const logFilePath = path.join(__dirname, "server.log");

// Function to parse log file and analyze data
function analyzeLogs(date) {
    const logData = fs.readFileSync(logFilePath, "utf-8");
    const logLines = logData.split("\n").filter(line => line.trim() !== "");

    const ipCount = {};  // Store IP occurrences
    const hourCount = {}; // Store hourly traffic

    // Process each log line
    logLines.forEach(line => {
        const match = line.match(/^(\S+) - - \[(\d{4}-\d{2}-\d{2}) (\d{2}):\d{2}:\d{2}.\d{3}\]/);
        if (match) {
            const ip = match[1];
            const logDate = match[2];
            const hour = match[3];

            if (logDate === date) {
                ipCount[ip] = (ipCount[ip] || 0) + 1;
                hourCount[hour] = (hourCount[hour] || 0) + 1;
            }
        }
    });

    // Sort results for better readability
    const sortedIPs = Object.entries(ipCount).sort((a, b) => b[1] - a[1]);
    const sortedHours = Object.entries(hourCount).sort((a, b) => a[0] - b[0]);

    console.log("\nIP Address Histogram:");
    console.log("IP Address            Occurrences");
    console.log("-----------------------------------");
    sortedIPs.forEach(([ip, count]) => console.log(`${ip.padEnd(20)} | ${count}`));

    console.log("\nHourly Traffic Histogram:");
    console.log("Hour  | Visitors");
    console.log("--------------------");
    sortedHours.forEach(([hour, count]) => console.log(`${hour.padEnd(5)} | ${count}`));

    return { sortedIPs, sortedHours };
}

// Function to get IPs contributing to 85% of traffic
function getTopIPs(sortedIPs) {
    const totalHits = sortedIPs.reduce((sum, [, count]) => sum + count, 0);
    let cumulative = 0;
    let topIPs = [];

    for (const [ip, count] of sortedIPs) {
        cumulative += count;
        topIPs.push([ip, count]);
        if (cumulative / totalHits >= 0.85) break;
    }

    console.log("\nTop IPs contributing to 85% of traffic:");
    console.log("IP Address            Occurrences");
    console.log("-----------------------------------");
    topIPs.forEach(([ip, count]) => console.log(`${ip.padEnd(20)} | ${count}`));
}

// Function to get hours contributing to 70% of traffic
function getTopHours(sortedHours) {
    const totalTraffic = sortedHours.reduce((sum, [, count]) => sum + count, 0);
    let cumulative = 0;
    let topHours = [];

    for (const [hour, count] of sortedHours) {
        cumulative += count;
        topHours.push([hour, count]);
        if (cumulative / totalTraffic >= 0.70) break;
    }

    console.log("\nTop Hours contributing to 70% of traffic:");
    console.log("Hour  | Visitors");
    console.log("--------------------");
    topHours.forEach(([hour, count]) => console.log(`${hour.padEnd(5)} | ${count}`));
}

// Get date from user input
const selectedDate = process.argv[2]; // Example: 2025-02-10
if (!selectedDate) {
    console.error("Please provide a date in YYYY-MM-DD format.");
    //process.exit(1);
}

// Execute Analysis
const { sortedIPs, sortedHours } = analyzeLogs(selectedDate);
getTopIPs(sortedIPs);
getTopHours(sortedHours);

// Export the analyzeLogs function to make it available for use in other modules
module.exports = { analyzeLogs };