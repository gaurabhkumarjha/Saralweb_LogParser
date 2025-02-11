const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require("cors");
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
const logFilePath = path.join(__dirname, 'access.log');

// Function to parse log file
const parseLogFile = (filePath) => {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');
    const logEntries = lines.map(line => {
        const [ip, , , timestamp, ...rest] = line.split(' ');
        return { ip, timestamp: timestamp.replace('[', '').replace(']', '') };
    });
    return logEntries;
};

// Function to generate IP histogram
const generateIPHistogram = (logEntries, date) => {
    const ipCounts = {};
    logEntries.forEach(entry => {
        if (entry.timestamp.startsWith(date)) {
            ipCounts[entry.ip] = (ipCounts[entry.ip] || 0) + 1;
        }
    });
    return ipCounts;
};

// Function to generate hourly traffic histogram
const generateHourlyTrafficHistogram = (logEntries, date) => {
    const hourlyCounts = {};
    logEntries.forEach(entry => {
        if (entry.timestamp.startsWith(date)) {
            const hour = entry.timestamp.split(':')[1];
            hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
        }
    });
    return hourlyCounts;
};

// Function to find IPs contributing to 85% of traffic
const findTopIPs = (ipCounts, totalHits) => {
    const sortedIPs = Object.entries(ipCounts).sort((a, b) => b[1] - a[1]);
    let sum = 0;
    const topIPs = [];
    for (const [ip, count] of sortedIPs) {
        sum += count;
        topIPs.push(ip);
        if (sum / totalHits >= 0.85) break;
    }
    return topIPs;
};

// Function to find hours contributing to 70% of traffic
const findTopHours = (hourlyCounts, totalHits) => {
    const sortedHours = Object.entries(hourlyCounts).sort((a, b) => b[1] - a[1]);
    let sum = 0;
    const topHours = [];
    for (const [hour, count] of sortedHours) {
        sum += count;
        topHours.push(hour);
        if (sum / totalHits >= 0.70) break;
    }
    return topHours;
};

// API endpoint to get histograms and statistics
app.get('/api/logs', (req, res) => {
    const logEntries = parseLogFile(logFilePath);
    const date = req.query.date || '17/May/2015';

    const ipHistogram = generateIPHistogram(logEntries, date);
    const hourlyHistogram = generateHourlyTrafficHistogram(logEntries, date);

    const totalHits = Object.values(ipHistogram).reduce((sum, count) => sum + count, 0);
    const topIPs = findTopIPs(ipHistogram, totalHits);
    const topHours = findTopHours(hourlyHistogram, totalHits);

    res.json({
        ipHistogram,
        hourlyHistogram,
        topIPs,
        topHours
    });
});
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});