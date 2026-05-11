const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('Postgresql.md', 'utf8');

// Simple regex to extract blocks of CREATE TABLE IF NOT EXISTS
const createTableRegex = /CREATE TABLE IF NOT EXISTS [\s\S]*?;/g;
const matches = content.match(createTableRegex);

if (matches) {
  fs.writeFileSync('scratch/create_new_tables.sql', matches.join('\n\n'));
  console.log(`Extracted ${matches.length} CREATE TABLE statements.`);
} else {
  console.log('No CREATE TABLE statements found.');
}
