let tableName = '__none__';
let reachedHyphens = false;
let newTable = false;
let columnNames = [];
let values = [];
let hyphensCount = 0;
let columnCharacterCount = 0;
let result = '';

const processLine = (line) => {
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
      let createTableStatement =
        'CREATE TABLE IF NOT EXISTS ' +
        tableName +
        '(' +
        columnNames.map((c) => c.trim() + ' varchar(255)').join(', ') +
        ');';

      // Generate SQL insert statements
      const insertStatements = [];
      for (let i = 0; i < values.length; i++) {
        const insertQuery = `INSERT INTO ${tableName.trim()} (${columnNames
          .map((c) => c.trim())
          .join(', ')}) VALUES (${values[i]
          .map((v) => `'${v.trim()}'`)
          .join(', ')});`;
        insertStatements.push(insertQuery);
      }

      result += insertStatements.join('\n');

      if (!line.includes('EOF')) {
        result += '\n\n';
      }
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

function generateQueries() {
  // Get the input string value
  var inputString = document.getElementById('inputString').value;

  // Generate the queries
  const lines = inputString.trim().split('\n');
  lines.push('EOF');

  // Process SQL statements
  lines.forEach(processLine);

  // Show the output element with animation
  var outputElements = document.querySelectorAll('.output');
  outputElements.forEach((element) => {
    element.style.display = 'block';
    element.classList.add('fade-in');
  });
  // Display the generated queries
  var outputElement = document.getElementById('generatedQueries');
  outputElement.textContent = result;
}

function copyToClipboard() {
  var outputElement = document.getElementById('generatedQueries');
  var generatedQueries = outputElement.textContent;

  navigator.clipboard
    .writeText(generatedQueries)
    .then(() => {
      document.getElementById('message').style.display = 'inline';
    })
    .catch((error) => {
      console.error('Failed to copy to clipboard:', error);
    });
}
