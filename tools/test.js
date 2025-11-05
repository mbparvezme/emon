import { EMONParser } from './parser.js';
import { EMONConverter } from './converter.js';

const emonText = `
#employee(id:number, name:string, skills:#skill[])
#skill(name:string, level:string)
=1,Parvez,[{PHP,Expert},{JS,Intermediate}]
`;

const parser = new EMONParser();
const converter = new EMONConverter();

const lines = emonText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
lines.forEach(line => {
    if (line.startsWith('#')) parser._parseDefinition(line);
});

const json = converter.emonToJSON(emonText);
console.log('JSON Output:', JSON.stringify(json, null, 2));

/**
  JSON Output: [
    {
      "name": "Parvez",
      "age": 30,
      "verified": true,
      "profile": [ "Developer", "NY, USA" ]
    },
    {
      "name": "Rafi",
      "age": 27,
      "verified": false,
      "profile": [ "Designer", "Dhaka, BD" ]
    }
  ]
 */

const emonString = converter.jsonToEMON(json, 'user');
console.log('Reconstructed EMON:\n', emonString);

/**
  Reconstructed EMON:
  #profile(bio:string,location:string)
  #user(name:string,age:number,verified:bool,profile:#profile)
  =Parvez,30,true,{Developer,"NY, USA"}
  =Rafi,27,false,{Designer,"Dhaka, BD"}
*/