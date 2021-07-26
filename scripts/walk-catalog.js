const path = require('path');
const fs = require('fs');
const nconf = require('nconf')
const assert = require('assert')


const config = path.join(__dirname, '../config/app.json')

nconf.argv().env().file({ file: config });

const CATALOG = nconf.get('CATALOG')
console.log( CATALOG )

const {memoize} = require('../lib/memoization');
const { exit } = require('process');
const { hasTags } = require('../lib/cbzUtils');


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




async function catalog(root){

    let files = await memoize(walk, root);

    let archives = files.filter(file => {
        return file.endsWith('cbz');
    })

    let tagged = [];

    while (archives.length){
        let archive = archives.pop();
        let classified = await memoize( hasTags, archive);
        console.log( `==> ${archives.length} ==> ${archive}, tagged = ${classified}`)
        if ( classified )
            tagged.push(archive)
    }

    return tagged;
}



catalog(CATALOG).then( files => {
    console.log( `${files.length} archives returned`)
}).catch( err => {
    console.error( `Fatal error: ${err}`);
}).finally(() => {
    exit();
})

