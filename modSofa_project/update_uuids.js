const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

const uuids = {
  bp_header: randomUUID(),
  bp_module: randomUUID(),
  bp_script: randomUUID(),
  rp_header: randomUUID(),
  rp_module: randomUUID()
};

console.log('\n📋 Copie ces UUIDs dans ton manifest.json :\n');
console.log(`BP Header:  ${uuids.bp_header}`);
console.log(`BP Module:  ${uuids.bp_module}`);
console.log(`BP Script:  ${uuids.bp_script}`);
console.log(`RP Header:  ${uuids.rp_header}`);
console.log(`RP Module:  ${uuids.rp_module}\n`);

fs.writeFileSync('project_uuids.json', JSON.stringify(uuids, null, 2));
console.log('✅ Sauvegardé dans project_uuids.json\n');
