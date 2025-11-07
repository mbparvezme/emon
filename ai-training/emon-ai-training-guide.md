# EMON AI Training Guide

This guide outlines the critical features of the **EMON (Efficient Minimal Object Notation)** format that must be prioritized during model training to ensure the AI can accurately parse, generate, and validate EMON data.

EMON's core design philosophy is to achieve maximum data density by eliminating redundant JSON syntax (quotes, colons, structural brackets) wherever the schema can provide positional context. This efficiency makes the parsing rules unique and demanding on the AI model.

<br>

## Training Goals

The AI model must be trained to:

1. **Parse and Convert Data (Core)**: Translate EMON positional data (`=val1,val2`) into structured JSON objects, handling all quoting and nesting syntax correctly.
2. **Understand Metadata (Schema Logic)**: Translate EMON schema definitions (`#type(...)`) into formal JSON structure/Schema concepts (Format B training).
3. **Handle Efficiency Rules**: Strictly enforce rules regarding quoting, spacing, and multiline text preservation to achieve fidelity and conciseness.

<br>

## Core Principles to Emphasize

The model must learn to recognize and convert these structural components with high fidelity:

| Component | EMON Syntax  | Focus Area |
|-----------|--------------|------------|
| **Schema Declaration**    | `#typeName(...)` or `#typeName(...)[]`  | Defines field order, type, and whether the root is a single object or an array. The AI must use this schema as the absolute truth for positional mapping. |
| **Data Record**           | `=val1,val2,val3`                       | Positional mapping is critical. The AI must rigorously verify the number of values supplied matches the schema fields exactly. Mismatches must result in clear errors. |
| **Unquoted Strings**      | `value`                                 | Efficiency rule: The AI must only apply quotes to strings in the JSON output if the EMON input included quotation marks (because it contained spaces, commas, or special chars like `[]`). |
| **Multiline Text**        | `"""..."""`                             | This block requires strict preservation. All internal line breaks, whether `\n` or `\r\n`, must be converted to the JSON string escape sequence `\n`. All leading/trailing whitespace must be kept. |
| **Nested Objects/Arrays** | `[val1,val2]`, `{val1,val2}`            | These structures are compact. The AI must handle the recursive mapping of fields within the parentheses `(...)` of an inline type and the explicit `{}` brackets for nested data. |
| **Type References**       | `field:#type`                           | The AI must understand that `#type` indicates an object reference to a globally defined schema, necessary for deeply nested structures (5+ levels). |
| **Primitives**            | `number`, `string`, `bool`, `null`      | The AI must accurately cast these types regardless of their position or surrounding structure. |

<br>

## Dataset Format (`.jsonl` Structure)

The provided dataset uses the JSON Lines format, mixing two instruction types to ensure comprehensive skill acquisition.

**Format A: Data Conversion (Approx. 70-80% of data)**

This format teaches the model the complexity of data parsing. A strong emphasis on **array data, quoting edge cases, and multiline blocks** is achieved via this format.

```json
{
  "emon": "#user(id:number, name:string)\n=1,Jane",
  "json": "{\"id\":1,\"name\":\"Jane\"}",
  "description": "..."
}
```

**Format B: Schema Conversion (Approx. 20-30% of data)**

This format ensures the model learns the structural metadata translation. It teaches the AI that `id:number` in EMON must map to a JSON structure where `id` is a `number` type.

```json
{
  "instruction": "Convert this EMON schema to JSON schema.",
  "input": "#item(price:number, active:bool)",
  "output": "{ \"price\": \"number\", \"active\": \"boolean\" }",
  "description": "..."
}
```

<br>

## Training Strategy Notes

1. **Contextual Learning and Type Ambiguity**: The model must be trained to resolve ambiguous strings. For example, in EMON, `admin` is a string, but `true` is a boolean. The AI must use the schema's type definition (`isActive:bool` or `role:string`) to correctly cast the literal value.
2. **Whitespace/Comment Handling**: The AI must rigorously learn to drop all EMON comments (`//`) during conversion. It must also ignore redundant structural spacing (e.g., inside `[]` or `{}` blocks) unless that spacing is explicitly contained within the triple quotes (`"""`).
3. **Quoting Edge Cases**: Focus heavily on examples involving strings that require quotes (`"New York"`, `"A,B"`) versus those that do not (`UserA`, `data_1.0`). Test escaped quotes (`\"`) thoroughly.
4. **Error Handling & Validation (Rule 15)**: The dataset should include samples that demonstrate invalid EMON (e.g., mismatching field count, invalid character in an unquoted string) and train the model to output a descriptive error message instead of failing silently or attempting a bad conversion. This is key to reliability.
5. **Handling Deep Nesting**: The AI needs extensive training on nested data, often referred to by a type reference (`#type`). This ensures it can correctly build the deeply nested JSON object structure from shallow, comma-separated EMON data.