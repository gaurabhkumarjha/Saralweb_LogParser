const fs = require("fs");
const path = require("path");

// Path to log file
const logFilePath = path.join(__dirname, "../server.log");

const Filer_IP_with_Date = async (date) => {
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
    return { sortedIPs, sortedHours };
}


exports.AnalayzeLogs = async (req, res) => {
    try {
        const { datestamps } = req.params;
        const date = datestamps;
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

        return res.status(200).json({ sortedIPs, sortedHours });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error processing log file" });
    }
}

exports.Get_Top_85 = async (req, res) => {
    try {
        const { datestamps } = req.params;
        const date = datestamps;
        const { sortedIPs, sortedHours } = await Filer_IP_with_Date(date);
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

        return res.status(200).json({ topIPs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error processing log file" });
    }
}

exports.Get_Top_70 = async (req, res) => {
    try {
        const { datestamps } = req.params;
        const date = datestamps;
        const { sortedIPs, sortedHours } = await Filer_IP_with_Date(date);
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

        return res.status(200).json({ topHours });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error processing log file" });
    }
}