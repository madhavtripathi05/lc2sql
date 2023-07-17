import * as fs from 'fs';

let tableName = '__none__';
let reachedHyphens = false;
let newTable = false;
let columnNames: string[] = [];
let values: string[][] = [];
let hyphensCount = 0;
let columnCharacterCount = 0;

const processLine = (line: string) => {
  if (line.trim().startsWith('|')) {
    if (newTable) {
      newTable = false;
      columnNames = line.split('|').filter((value) => value !== '');
      columnCharacterCount = columnNames.reduce(
        (acc, curr) => acc + curr.trim().length,
        0
      );
    }

    // Count the hyphens
    if (line.includes('-')) {
      hyphensCount = [...line].reduce(
        (acc, curr) => (curr === '-' ? acc + 1 : acc),
        0
      );
    }

    // After the separator line is reached, start reading the values
    if (reachedHyphens) {
      values.push(line.split('|').filter((value) => value !== ''));
    }

    // if the separator line is reached, set the flag
    if (hyphensCount === columnCharacterCount) reachedHyphens = true;
  }

  // if new table comes, print the previous table
  if (line.includes('=') || line.includes('EOF')) {
    newTable = true;
    if (tableName !== '__none__') {
      // Generate SQL create table statement
      console.log(
        'CREATE TABLE IF NOT EXISTS ' +
          tableName +
          '(' +
          columnNames.map((c) => c.trim() + ' varchar(255)').join(', ') +
          ');'
      );

      // Generate SQL insert statements
      const insertStatements: string[] = [];
      for (let i = 0; i < values.length; i++) {
        const insertQuery = `INSERT INTO ${tableName.trim()} (${columnNames
          .map((c) => c.trim())
          .join(', ')}) VALUES (${values[i]
          .map((v) => `'${v.trim()}'`)
          .join(', ')});`;
        insertStatements.push(insertQuery);
      }

      // Output the SQL insert queries
      console.log(insertStatements.join('\n'));
      if (!line.includes('EOF')) console.log();
    }
    // Reset
    values = [];
    columnNames = [];
    hyphensCount = 0;
    columnCharacterCount = 0;
    tableName = line.split('=')[0];
    reachedHyphens = false;
  }
};

// Read the text file
fs.readFile('input.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Split the data by lines
  const lines = data.trim().split('\n');
  lines.push('EOF');

  // Print SQL statements
  lines.forEach(processLine);
});
