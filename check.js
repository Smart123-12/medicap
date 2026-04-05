const data = require('./eslint-output.json');
let result = "";
data.forEach(f => {
  if (f.errorCount > 0 || f.warningCount > 0) {
    result += f.filePath.replace(/\\/g, '/') + "\n";
    let uniq = new Set();
    f.messages.forEach(m => uniq.add(`  ${m.ruleId}: ${m.message.slice(0, 50)}...`));
    uniq.forEach(m => result += m + "\n");
  }
});
console.log(result.slice(0, 1800));
