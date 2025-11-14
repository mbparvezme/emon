import * as fs from 'fs';
import * as path from 'path';
import { EMON } from './src/index';

// --- Configuration ---
// Path is calculated relative to the current working directory of the test script.
// We assume the JSON file is located at the root for this example.
const INPUT_FILE_NAME = '../docs/benchmark-data/employee/employees.json';
const INPUT_PATH = path.join(__dirname, INPUT_FILE_NAME);

/**
 * Executes the conversion and prints the results in a readable format.
 */
function runConversionTest() {
    console.log(`\n--- Starting EMON Conversion Test ---`);

    try {
        // 1. Read JSON Data
        const jsonContent = fs.readFileSync(INPUT_PATH, 'utf-8');
        const jsonData = JSON.parse(jsonContent);

        console.log(`\n✅ Input File Read: ${INPUT_FILE_NAME}`);

        // 2. Perform Conversion and Retrieve Metadata
        const result = EMON.fromJSON(jsonData, 'employee').withMeta();

        // 3. Destructure and Print Results
        const emonOutput = result.emon;
        // const metaData: MetaData = result.meta;

        // Print EMON Output
        console.log('\n--- 📝 EMON Output ---');
        console.log(emonOutput);

        // Print Metadata
        // console.log('\n--- 📊 Metrics ---');
        // console.log(`Input Characters (JSON): ${metaData.input.chars} (${metaData.input.size})`);
        // console.log(`Output Characters (EMON): ${metaData.output.chars} (${metaData.output.size})`);
        // console.log(`Efficiency (Reduction): ${metaData.efficiency}`);
        // console.log('-------------------\n');

    } catch (error) {
        console.error('\n❌ Conversion Error:', error instanceof Error ? error.message : "An unknown error occurred.");
    }
}

// Run the function
runConversionTest();