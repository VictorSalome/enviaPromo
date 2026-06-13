const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/home/ubuntu/enviaPromo/data/promo-monitor.db');

db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
  if (err) {
    console.error('Erro:', err);
    return;
  }
  console.log('Tabelas:', tables.map(t => t.name));
  
  let count = 0;
  tables.forEach(t => {
    db.all("SELECT * FROM " + t.name + ";", (e, rows) => {
      if (!e && rows.length > 0) {
        console.log('\n=== ' + t.name + ' ===');
        console.log(JSON.stringify(rows, null, 2));
      }
      count++;
      if (count === tables.length) {
        setTimeout(() => db.close(), 500);
      }
    });
  });
});
