const fs = require("fs");
let content = fs.readFileSync("src/lib/i18n.ts", "utf8");

// Find the line with RegExp and log it
const lines = content.split("\n");
const regExpLine = lines.findIndex(l => l.includes("RegExp"));
console.log("Line", regExpLine + 1, "before:", JSON.stringify(lines[regExpLine]));

// The file currently has: new RegExp('\\\\\\\\{\\\\\\\\{'
// We need: new RegExp('\\\\{\\\\{'
// In the actual file bytes, this means replacing 4 backslashes with 2 backslashes before each brace
lines[regExpLine] = lines[regExpLine].replace(
  /new RegExp\('([\\]+)\{([\\]+)\{/,
  "new RegExp('\\\\{\\\\{"
);
lines[regExpLine] = lines[regExpLine].replace(
  /\}([\\]+)\}'/g,
  "\\}\\}'"
);

console.log("Line", regExpLine + 1, "after:", JSON.stringify(lines[regExpLine]));
fs.writeFileSync("src/lib/i18n.ts", lines.join("\n"));
console.log("Done");
