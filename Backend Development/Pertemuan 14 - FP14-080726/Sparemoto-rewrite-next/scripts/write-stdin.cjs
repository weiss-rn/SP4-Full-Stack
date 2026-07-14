const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", process.argv[2]);
let data = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { data += chunk; });
process.stdin.on("end", () => {
  fs.writeFileSync(filePath, data, "utf8");
  console.log("Written:", filePath, data.length, "bytes");
});
