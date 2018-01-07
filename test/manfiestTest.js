/**
 * Created by pi on 9/21/16.
 */
var Manifest = require('chrome-manifest');
var manifest = new Manifest('manifest.json');
// get/set
// console.log(manifest.content_scripts.[0].matches.length);
// console.log(manifest.content_scripts.[0]);
// console.log(manifest.background.scripts);
console.log(manifest.manifest_version);
console.log(manifest['permissions']);