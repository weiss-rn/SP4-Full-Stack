const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", process.argv[2]);
const content = process.argv.slice(3).join("\n");
fs.writeFileSync(filePath, content, "utf8");
console.log("Written:", filePath, content.length, "bytes");
