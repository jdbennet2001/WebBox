/*
 Check tag extraction logic
 */

const path = require('path')

const {tags, contains} = require('../lib/cbzUtils')

const TEST_FILE = path.join(__dirname, './data/fl91.cbz')


 test('Extract tag data', () => {
   let data = tags(TEST_FILE);
   
   expect(data).toHaveProperty('volume_name', 'The Flash')

  });


  test('Check tag data present', () => {
    let data = contains(TEST_FILE, 'tags.json');
    
    expect(data).toBe(true)
 
   });
 