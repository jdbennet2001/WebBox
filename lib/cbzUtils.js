/*
 CBZ File handling utilities
 */

const admZip = require('adm-zip');

function tags(filename) {
   const zip = new admZip(filename);
   const tagText = zip.readAsText('tags.json')
   const tagData = JSON.parse(tagText);
   return tagData;
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