const mega = require('megajs');
const multer = require("multer");
const sendEmail=require("./mailer/mailer");
const {siteEmail}=require("../configs/credentials");
require("dotenv").config();
const { SITE_EMAIL, MEGA_PASSWORD } = process.env;

async function initializeStorage() {
  return new Promise((resolve, reject) => {
    const storage = mega({
      email: SITE_EMAIL,
      password: MEGA_PASSWORD,
    });

    storage.on("ready", async() => {
      const {spaceUsed, spaceTotal, 
        downloadBandwidthTotal, downloadBandwidthUsed,
       sharedBandwidthUsed,  sharedBandwidthLimit } = await storage.getAccountInfo()
 
 //email admin if any of the quota is getting exceeded
 if((downloadBandwidthTotal- downloadBandwidthUsed) < 104857600 ){
   sendEmail(
   siteEmail,
   "Mega Storage Warning",
   "Free tier on your mega account is set to expire as download bandwith remaining only 100MB"
   )
 }
 
 if((spaceTotal-spaceUsed) < 104857600 ){
   sendEmail(
   siteEmail,
   "Mega Storage Warning",
    "Free tier on your mega account is set to expire as total remaining free space is only 100MB"
   )
 }
 
 if((sharedBandwidthLimit-sharedBandwidthUsed) < 0.1 ){
   sendEmail(
   siteEmail,
   "Mega Storage Warning",
   "Free tier on your mega account is set to expire as shared Bandwidth Used remaining only 100MB"
   )
 }
      console.log("✅ Connected to MEGA storage.");
      resolve(storage);
    });

    storage.on("error", (error) => {
      console.error("❌ MEGA connection error:", error);
      reject(error);
    });
  });
}
// //Initialize MEGA storage
// const storage = mega({
//   email: MEGA_EMAIL, 
//   password: MEGA_PASSWORD,  
// });

// //Wait for login
// storage.on("ready", async () => {
  
//   console.log("Connected to MEGA storage.");
// });



//Upload to Mega 
async function uploadFile(fileBuffer, fileName, folderName) {
  try {
    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
    const fileSize = buffer.length;

    if (!fileSize) {
      throw new Error('File buffer is empty or invalid.');
    }
let coverFolder=null;
    // Get the root storage mounts
    const root = storage.mounts[0];

    // Find or create the "cover" folder
    coverFolder = await root.children.find((child) => child.name == folderName);
    if (!coverFolder) {
      coverFolder = await root.mkdir(folderName);
    }

    // Upload the file into the "cover" folder
    const file = await coverFolder.upload(fileName, buffer).complete;
    return {
      name: file.name,
      size: file.size,
      timestamp: file.timestamp,
      directory: file.directory,
      nodeId: file.nodeId,
      downloadId: file.downloadId
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('File upload failed: ' + error.message);
  }

    storage.on('error', (error) => {
      reject(new Error('Error logging in to MEGA: ' + error));
    });
}

//Retrieve from Mega
async function getFileStream(filename, folderName) {
  try {
    const storage=await initializeStorage();
    //Get the root storage mount
    const root = storage.mounts[0];

    // Find the "cover" folder
    const coverFolder = root.children.find((child) => child.name === folderName);

    if (!coverFolder) {
      throw new Error('Cover folder not found');
    }

    // Find the file inside theI "cover" folder
    const file = coverFolder.children.find((child) => child.nodeId === filename);

    if (!file) {
      throw new Error('File not found in cover folder');
    }

    // Download and return the file stream
    const stream = await file.download();
    return stream;
  } catch (error) {
    console.error("Error retrieving file:", error);
    throw new Error(error.message);
   }
}


//Delete from Mega
async function deleteFile(filename, folderName) {
  try {
    const storage=await initializeStorage();
      // Get the root storage mount
    const root = storage.mounts[0];

    // Find the "cover" folder
    const coverFolder = root.children.find((child) => child.name === folderName);

    if (!coverFolder) {
      throw new Error('Cover folder not found');
    }

    // Find the file inside the "cover" folder
    const file = coverFolder.children.find((child) => child.nodeId === filename);

    if (!file) {
      throw new Error('File not found in cover folder');
    }
    
    const deleteF = await file.delete(true);
    
    return "File deleted successfully"; // Return success message
  } catch (error) {
    throw new Error(error.message || "An error occurred while deleting the file");
  }
}

module.exports = { uploadFile, deleteFile, getFileStream};

/* type: 0,
  spaceUsed: 2735406,
  spaceTotal: 21474836480,
  downloadBandwidthTotal: 11258999068426240,
  downloadBandwidthUsed: 0,
  sharedBandwidthUsed: 0,
  sharedBandwidthLimit: 25.000381475547417

use nodeId to access files
const file = coverFolder.children.find((child) => child.nodeId === namefromDB);

*/