const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const schemaPath = path.join(__dirname, '../../../database/schema.sql');
const cmd = `psql -h ${process.env.DB_HOST||'localhost'} -U ${process.env.DB_USER||'postgres'} -d ${process.env.DB_NAME||'keremet_airlines'} -f "${schemaPath}"`;

try {
  console.log('⚙  Инициализация базы данных...');
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD } });
  console.log('✓  База данных успешно создана!');
} catch (e) {
  console.error('Ошибка инициализации БД:', e.message);
  process.exit(1);
}
