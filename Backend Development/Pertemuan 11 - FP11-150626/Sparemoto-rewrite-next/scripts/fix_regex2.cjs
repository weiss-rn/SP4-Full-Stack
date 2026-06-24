const fs = require("fs");
let content = fs.readFileSync("src/lib/i18n.ts", "utf8");

// Find the RegExp line and fix: 4 backslashes before braces -> 2 backslashes
// Current file content: new RegExp('\\\\\\\\{\\\\\\\\{'
// We need:             new RegExp('\\\\{\\\\{'
const lines = content.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("new RegExp(") && lines[i].includes("param")) {
    console.log("Found regex line at", i + 1);
    console.log("Before:", lines[i].trim());
    
    // Extract the regex part between RegExp( and , 'g')
    // Replace 4-backslash sequences with 2-backslash sequences
    let line = lines[i];
    line = line.replace(/new RegExp\('(\\\\)+(\\{)/g, "new RegExp('\\\\{");
    line = line.replace(/(\\)+(\\})',/g, "\\\\}',");
    
    console.log("After:", line.trim());
    lines[i] = line;
    break;
  }
}

fs.writeFileSync("src/lib/i18n.ts", lines.join("\n"));

// Verify
const verify = fs.readFileSync("src/lib/i18n.ts", "utf8");
const match = verify.match(/new RegExp\([^)]+param[^)]+\)/);
if (match) {
  console.log("Verified regex:", match[0]);
}
