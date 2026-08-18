require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const BAD = String.fromCharCode(0xFFFD);
  const re = new RegExp(BAD);

  const found = [];
  for (const coll of ['reports', 'civicclusters', 'discussions']) {
    const docs = await db
      .collection(coll)
      .find({ $or: [{ title: re }, { categoryLabel: re }, { description: re }, { body: re }] })
      .toArray();
    docs.forEach((d) => found.push({ coll, doc: d }));
  }

  console.log('Docs containing U+FFFD:', found.length);
  found.forEach(({ coll, doc }) => {
    console.log(' -', coll, '|', (doc.title || '(untitled)').slice(0, 70), '| catLabel:', doc.categoryLabel);
  });

  // Repair: replace the replacement char with a middle dot, or drop the label
  // when it is corrupt and a clean category exists.
  let updated = 0;
  for (const { coll, doc } of found) {
    const set = {};
    if (typeof doc.categoryLabel === 'string' && doc.categoryLabel.includes(BAD)) {
      const cleaned = doc.categoryLabel.replace(new RegExp(BAD, 'g'), '\u00B7').trim();
      set.categoryLabel = cleaned;
    }
    if (typeof doc.title === 'string' && doc.title.includes(BAD)) {
      set.title = doc.title.replace(new RegExp(BAD, 'g'), '\u00B7').trim();
    }
    if (typeof doc.description === 'string' && doc.description.includes(BAD)) {
      set.description = doc.description.replace(new RegExp(BAD, 'g'), '\u00B7').trim();
    }
    if (typeof doc.body === 'string' && doc.body.includes(BAD)) {
      set.body = doc.body.replace(new RegExp(BAD, 'g'), '\u00B7').trim();
    }
    if (Object.keys(set).length) {
      await db.collection(coll).updateOne({ _id: doc._id }, { $set: set });
      updated++;
      console.log('   fixed ->', JSON.stringify(set.categoryLabel || set.title || ''));
    }
  }
  console.log('Updated docs:', updated);
  process.exit(0);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
