const assert = require('assert');
const EMON = require('../tools/javascript/emon');

// -----------------------
// Sample Data
// -----------------------
const jsonData = [
  { id: 1, name: "Alice", tags: ["admin","editor"], active: true },
  { id: 2, name: "Bob", tags: ["user"], active: false }
];

const emonStr = EMON.toEMON(jsonData);

// -----------------------
// Tests
// -----------------------

// Test 1: EMON.toEMON() converts JSON -> EMON
console.log("Test 1: JSON -> EMON");
const emonResult = EMON.toEMON(JSON.stringify(jsonData));
assert(emonResult.includes('#emon('), "Schema not generated properly");
console.log("✅ Passed");

// Test 2: EMON.toJSON() converts EMON -> JSON
console.log("Test 2: EMON -> JSON");
const jsonResult = EMON.toJSON(emonStr);
assert.deepStrictEqual(jsonResult, jsonData, "EMOn -> JSON conversion failed");
console.log("✅ Passed");

// Test 3: EMON.parse() chainable
console.log("Test 3: Chainable parse()");
const chain = EMON.parse(jsonData);
assert(typeof chain.toEMON === 'function', "Chainable parse failed");
console.log("✅ Passed");

// Test 4: Validation EMON and JSON
console.log("Test 4: Validation");
assert(EMON.isValid(emonStr), "Valid EMON not detected");
assert(EMON.isValid(JSON.stringify(jsonData), 'json'), "Valid JSON not detected");
console.log("✅ Passed");

// Test 5: Chainable isValid()
console.log("Test 5: Chainable isValid()");
assert(EMON.parse(JSON.stringify(jsonData)).isValid('json'), "Chain JSON validation failed");
console.log("✅ Passed");

// Test 6: Auto schema generation
console.log("Test 6: Auto schema generation");
const schema = EMON.generateSchema(jsonData, 'user');
assert(schema.includes('#user('), "Auto schema not generated correctly");
console.log("✅ Passed");

// Test 7: Meta-analysis from JSON to EMON Input
console.log("Test 7: Meta-analysis JSON to EMON: Input");
const emonMetaInput = EMON.parse(jsonData).toEMON().meta();
assert(emonMetaInput.input && emonMetaInput.input.chars > 0, "EMON meta failed");
console.log("✅ Passed");

// Test 8: Meta-analysis from JSON to EMON Output
console.log("Test 8: Meta-analysis JSON to EMON: Output");
const emonMetaOutput = EMON.parse(jsonData).toEMON().meta();
assert(emonMetaOutput.input && emonMetaOutput.input.chars > 0, "EMON meta failed");
console.log("✅ Passed");

// Test 9: Meta-analysis EMON to JSON: Input
console.log("Test 9: Meta-analysis EMON to JSON: Input");
const jsonMetaInput = EMON.parse(emonStr).toJSON().meta();
assert(jsonMetaInput.input && jsonMetaInput.input.chars > 0, "JSON meta failed");
console.log("✅ Passed");

// Test 10: Meta-analysis EMON to JSON: Output
console.log("Test 10: Meta-analysis EMON to JSON: Output");
const jsonMetaOutput = EMON.parse(emonStr).toJSON().meta();
assert(jsonMetaOutput.input && jsonMetaOutput.input.chars > 0, "JSON meta failed");
console.log("✅ Passed");

// Test 11: Meta-analysis EMON -> JSON efficiency
console.log("Test 11: Meta efficiency");
const efficiency = EMON.parse(emonStr).toJSON().meta();
assert(efficiency.efficiency, "Efficiency calculation failed");
console.log("✅ Passed");

// Test 12: Single object conversion
console.log("Test 12: Single object conversion");
const singleJson = { id: 1, name: "Alice", active: true };
const singleEmon = EMON.toEMON(singleJson);
const singleJsonResult = EMON.toJSON(singleEmon);
assert.deepStrictEqual(singleJson, singleJsonResult, "Single object conversion failed");
console.log("✅ Passed");

// Test 13: Nested object conversion
console.log("Test 13: Nested object conversion");
const nestedJson = { id: 1, name: "Alice", profile: { age: 30, city: "NY" } };
const nestedEmon = EMON.toEMON(nestedJson);
const nestedJsonResult = EMON.toJSON(nestedEmon);
assert.deepStrictEqual(nestedJson, nestedJsonResult, "Nested object conversion failed");
console.log("✅ Passed");

// Test 14: Empty array conversion
console.log("Test 14: Empty array conversion");
const emptyArr = [];
const emptyEmon = EMON.toEMON(emptyArr);
const emptyJson = EMON.toJSON(emptyEmon);
assert.deepStrictEqual(emptyArr, emptyJson, "Empty array conversion failed");
console.log("✅ Passed");

// Test 15: Boolean and number fields
console.log("Test 15: Boolean and number fields");
const boolNum = { flag: true, count: 10 };
const boolNumEmon = EMON.toEMON(boolNum);
const boolNumJson = EMON.toJSON(boolNumEmon);
assert.deepStrictEqual(boolNum, boolNumJson, "Boolean/number conversion failed");
console.log("✅ Passed");

// Test 16: Chaining multiple conversions
console.log("Test 16: Multiple chaining");
const chainMulti = EMON.parse(jsonData).toEMON().toJSON().toEMON().toJSON().value();
assert.deepStrictEqual(chainMulti, jsonData, "Multiple chaining failed");
console.log("✅ Passed");

// Test 17: Strings with spaces
console.log("Test 17: Strings with spaces");
const spaceStr = { name: "Alice A", title: "Project Manager" };
const spaceEmon = EMON.toEMON(spaceStr);
assert(spaceEmon.includes('"Alice A"') && spaceEmon.includes('"Project Manager"'), "Strings with spaces failed");
console.log("✅ Passed");

// Test 18: Meta unit conversion
console.log("Test 18: Meta unit conversion MB");
const metaMB = EMON.parse(jsonData).toEMON().meta('MB');
assert(metaMB.input.size.includes('MB'), "Meta unit MB failed");
console.log("✅ Passed");

// Test 19: Comment support
console.log("Test 19: Comment support");
const emonWithComment = `
// This is a comment
#test(name:string)
=Alice
`;
assert(EMON.isValid(emonWithComment), "Comment parsing failed");
console.log("✅ Passed");

// Test 20: Large dataset performance
console.log("Test 20: Large dataset performance");
const largeData = Array.from({length:1000}, (_,i)=>({id:i,name:"User"+i}));
const largeEmon = EMON.toEMON(largeData);
const largeJson = EMON.toJSON(largeEmon);
assert.deepStrictEqual(largeData, largeJson, "Large dataset failed");
console.log("✅ Passed");

console.log("🎉 All EMON tests passed!");