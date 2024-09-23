//Disk persistance
/*1.To extend the skill-sharing server to persist data on disk and reload it after restarts, 
  2.we can make use of Node.js’s fs module to read from and write to a JSON file. 
*/


//1.Importing necessary functions fromm node:fs module
import { readFileSync, writeFile } from "node:fs";
const fileName = "./talks.json";                     // Define the filename where talk data will be stored

SkillShareServer.prototype.updated = function() {    //Extend the SkillShareServer prototype to include an updated method
  this.version++;
  let response = this.talkResponse();                // Create a response object containing the current talks
  this.waiting.forEach(resolve => resolve(response));// Resolve any waiting promises with the updated talks response
  this.waiting = [];                                 // Clear the waiting array,as alll waiting requests has been resolved
  writeFile(fileName, JSON.stringify(this.talks), e => {   // Write the current talks data to disk as a JSON string
    if (e) {
         throw e;
    }
  });
};

//2.Function to load talks from the JSON file when the server starts
function loadTalks() {
  try {                                                   //Read the file and parse its contents as JSON
    return JSON.parse(readFileSync(fileName, "utf8"));
  } catch (e) {                                               // If there's an error (e.g., file not found), return an empty object
    return {};
  }
}

//3.Start the SkillShareServer with the loaded talks data
new SkillShareServer(loadTalks()).start(8000);
