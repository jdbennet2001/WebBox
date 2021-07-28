/*
 CBZ File handling utilities
 */

const admZip = require('adm-zip');

/*
 Return tags.json data for a given file. Returns empty object if no data found
 */
function tags(filename) {
   try{
      const zip = new admZip(filename);
      const tagText = zip.readAsText('tags.json')
      const tagData = JSON.parse(tagText);
      return tagData;
   }catch(err) {
      return {}
   }

}

function hasTags(zipfile){
   try{
      return contains(zipfile, 'tags.json')
   }catch( err ){
      console.error( `Skipping ${zipfile}, error ${err.message}`);
      return false;
   }
}

function contains(zipfile, filename){

   const zip = new admZip(zipfile);
   
   const zip_entries = zip.getEntries();

   const tag_entry = zip_entries.find( zen => {
      return zen.entryName == filename
   })

   return tag_entry != undefined;

}

module.exports = { tags, contains, hasTags }