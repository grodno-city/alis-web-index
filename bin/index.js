import program from 'commander';
import fs from 'fs';

import start from './fetch-books';

program
  .option('-s, --snapshot <n>', 'Add peppers')
  .parse(process.argv);

const snapshot = program.snapshot || './bin/.fetch-books-snapshot';
let nextId = 1;

if (fs.existsSync(snapshot)) {
  const lastFetchedId = Number(fs.readFileSync(snapshot, 'utf8'));
  nextId = lastFetchedId + 1;
}

start({ nextId, snapshot });

