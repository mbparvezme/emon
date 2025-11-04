import { EMONParser } from '../tools/parser.js';
import { EMONConverter } from '../tools/converter.js';

// Sample EMON text
const emonText = `
#profile(bio:string, location:string)
#user(name:string, age:number, verified:bool, profile:#profile)

=Parvez, 30, true, {"bio":"Developer", "location":"NY, USA"}
=Rafi, 27, false, {"bio":"Designer", "location":"Dhaka, BD"}
`;

// Initialize parser and converter
const parser = new EMONParser();
const converter = new EMONConverter();

// Parse definitions
emonText.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line) return;
    if (line.startsWith('#')) parser._parseDefinition(line);
});

// EMON → JSON
const jsonOutput = converter.emonToJSON(emonText);
console.log('JSON Output:', JSON.stringify(jsonOutput, null, 2));

// JSON → EMON
const emonOutput = converter.jsonToEMON(jsonOutput, 'user');
console.log('Reconstructed EMON:\n', emonOutput);

// Simple check
console.log('\n✅ Test Results');
console.log('Number of records:', jsonOutput.length === 2 ? 'PASS' : 'FAIL');
console.log(
    'First record name:',
    jsonOutput[0].name === 'Parvez' ? 'PASS' : 'FAIL'
);
console.log(
    'Second profile location:',
    jsonOutput[1].profile.location === 'Dhaka, BD' ? 'PASS' : 'FAIL'
);