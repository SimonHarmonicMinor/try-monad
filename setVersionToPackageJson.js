// eslint-disable-next-line no-undef
const newVersion = process.argv.slice(2)[0];
// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const fs = require('fs');
const fileName = 'package.json';
fs.readFile(fileName, 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    const result = data.replace(/"version": ".+"/g, `"version": "${newVersion}"`);

    fs.writeFile(fileName, result, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
});