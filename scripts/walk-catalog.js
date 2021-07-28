const path = require('path');
const fs = require('fs');
const nconf = require('nconf')
const assert = require('assert')
const moment = require('moment')
const jsonfile = require('jsonfile')


const config = path.join(__dirname, '../config/app.json')

nconf.argv().env().file({ file: config });

const CATALOG = nconf.get('CATALOG')
console.log( CATALOG )

const {memoize} = require('../lib/memoization');
const { exit } = require('process');
const { hasTags, tags } = require('../lib/cbzUtils');


// Validate key environment variables
assert( CATALOG, `Missing environment variable, catalog location`)

function walk(dir){

    let entries = fs.readdirSync(dir);

    console.log( `.. walking ${dir}`)

    // Drop hidden directories
    let visible = entries.filter( file => {
        return !file.startsWith('.')
    })

    // Work with fully paths, not relative data
    visible = visible.map( entry => {
        return path.join(dir, entry);
    })

    // Save files
    let files = visible.filter( entry =>{
        return fs.statSync(entry).isFile();
    })

    // Recurse into sub directories
    let directories = visible.filter( entry => {
        return fs.statSync(entry).isDirectory();
    })
    
    directories.forEach( directory => {
        let children = walk(directory);
        files = files.concat(children);
    })

    return files;
    
}

/*
 Return an array of tags + filename data for all tagged archives

 Summary: return archives.map( archive => {return archive[tags.json]})
 */
async function tagData(archives){

    let results = [];

    while (archives.length){
        let archive = archives.pop();

        const start = Date.now();
        let tags_data = await memoize( tags, archive);
        const end = Date.now()
        if ( Object.keys(tags_data).length > 0 ){ // Check for useful data..
            tags_data = Object.assign( {}, tags_data, {location: archive, file: path.basename(archive)})
            console.log( `==> extracting tags for ==> ${archives.length} ==> ${archive}, ${end - start} ms`)
            results.push(tags_data)
        }else{
            console.log( ` ==> skipping tags for ==> ${archives.length} ==> ${archive}, ${end - start} ms`)
        }
                
    }

    return results;

}

/*
 Filter a list of archives. Return only those that contain tag data

 Summary: return archives.filter( archive => {return archive[tags.json]})
 */
async function tagged(archives){

    let results = [];

    while (archives.length){
        let archive = archives.pop();
        let classified = await memoize( hasTags, archive);
        console.log( `(${moment().format('LTS')}) ==> checking tags for ==>  ${archives.length} ==> ${archive}, tagged = ${classified}`)
        if ( classified )
            results.push(archive)
    }

    return results;
}


async function catalog(root){

    // Get all files
    let files = await memoize(walk, root);

    // Just process the CBZ archives
    let archives = files.filter(file => { return file.endsWith('cbz') })
    
    // Extract the tag data
    let tag_entries = await tagData(archives)

    return tag_entries;

}
 
catalog(CATALOG).then( tags => {
    return jsonfile.writeFile('catalog-tags.json', tags, {spaces: 4})
}).catch( err => {
    console.error( `Fatal error: ${err}`);
}).finally(() => {
    exit();
})

