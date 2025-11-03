import { EMONParser } from './parser.js';
import { EMONConverter } from './converter.js';

const emonText = `
#profile(bio:string, location:string)
#user(name:string, age:number, verified:bool, profile:#profile)

=Parvez, 30, true, {"bio":"Developer", "location":"NY, USA"}
=Rafi, 27, false, {"bio":"Designer", "location":"Dhaka, BD"}
`;

// 1️⃣ Create parser and converter
const parser = new EMONParser();
const converter = new EMONConverter();

// 2️⃣ Parse definitions automatically
const lines = emonText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
lines.forEach(line => {
    if (line.startsWith('#')) parser._parseDefinition(line);
});

// 3️⃣ Convert EMON → JSON
const json = converter.emonToJSON(emonText);
console.log('JSON Output:', JSON.stringify(json, null, 2));

/* Output:
[
  ["Parvez", 30, true, { "bio": "Developer", "location": "NY, USA" }],
  ["Rafi", 27, false, { "bio": "Designer", "location": "Dhaka, BD" }]
]
*/

// 4️⃣ Convert JSON → EMON
const emonString = converter.jsonToEMON(json, 'user');
console.log('Reconstructed EMON:\n', emonString);

/* Output:
= "Parvez", 30, true, {"Developer","NY, USA"}
= "Rafi", 27, false, {"Designer","Dhaka, BD"}
*/
