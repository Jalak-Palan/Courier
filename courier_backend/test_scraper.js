const { scrapeTrackon } = require('./scrapers/trackon');

async function test() {
  console.log('Testing Trackon with ID 500500228607...');
  try {
    const result = await scrapeTrackon('500500228607');
    console.log('RESULT:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('TEST ERROR:', err);
  }
}

test();
