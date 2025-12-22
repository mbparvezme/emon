# EMON Guide for LLMs
This guide provides a comprehensive framework for training and fine-tuning Large Language Models (LLMs) to master **EMON (Efficient Modular Object Notation)**. EMON is engineered to maximize the "signal-to-noise" ratio in data, directly resulting in lower costs and higher reasoning accuracy.

## Why EMON for LLMs?
EMON offers three distinct advantages over JSON and YAML when used as an interchange format for LLMs:
- **Token Efficiency**: By eliminating repeated keys and reducing punctuation, EMON payloads are typically 40-70% smaller. This allows you to fit more data into the model's context window and reduces inference costs.
- **Positional Integrity**: Positional mapping forces the model to focus on data values rather than parsing repetitive structural markers. This reduces the risk of "structural hallucinations."
- **Reduced Attention Complexity**: LLMs spend significant "attention" energy on parsing JSON braces and quotes. EMON's minimalist syntax allows the model to allocate more cognitive resources to the actual content.

<br>

## Datasets for LLMs
To train LLMs effectively, use the following five datasets. They cover basic structures, complex nesting, and edge cases.
- [a.jsonl](/): Basic primitive mappings and nameless roots.
- [b.jsonl](/): Suffix-array notation (`type[]`) and list handling.
- [c.jsonl](/): Deep nesting with named type references (`#type`).
- [d.jsonl](/): Multi-line strings (`"""`) and quoting edge cases.
- [e.jsonl](/): Explicit `null` handling and strict type validation.

<br>

## Training Process 1: Zero-Shot Pattern Recognition
To help LLMs understand the mapping without explicit rules, present the EMON structure alongside its JSON equivalent. This "self-documenting" approach teaches the model that **position = key**.

**A. Example: Object Array**
```emon
#(id:number,name:string,tags:string[])[]
=1,Alice,[dev,admin]
=2,Bob,null
```

**JSON Equivalent**
```json
[
    { "id": 1, "name": "Alice", "tags": ["dev", "admin"] },
    { "id": 2, "name": "Bob", "tags": null }
]
```

**B. Example: Nested Objects**
```emon
#geo(lat:number,lng:number)
#(id:number,location:#geo)
=101,{23.81,90.41}
```

**JSON Equivalent**
```json
{
    "id": 101,
    "location": { "lat": 23.81, "lng": 90.41 }
}
```

<br>

## Training Process 2: Supervised Fine-Tuning (SFT)

Use the `.jsonl` datasets to train the LLM on bi-directional conversion.

**Format: JSON ↔ EMON Mapping**
```json
{
  "instruction": "Convert JSON to EMON",
  "input": "{\"user\": \"Parvez\", \"score\": 95}",
  "output": "#(user:string,score:number)\n=Parvez,95"
}
```

**Format: Schema Inference**

```json
{
  "instruction": "Generate the EMON schema for this data.",
  "input": "{\"name\": \"Alice\", \"roles\": [\"admin\"]}",
  "output": "#(name:string,roles:string[])"
}
```
<br>

## Critical Training Priorities

#### A. Nameless Root
LLMs must prioritize the first line `#(...)` as the root definition. If it ends in `[]`, the data rows that follow represent an array of objects.

#### B. Suffix Array Notation
Train the model to use the `type[]` suffix instead of the legacy `[type]` prefix.
- **Correct**: `skills:string[]`
- **Incorrect**: `skills:[string]`

#### C. Explicit Nulls
Strictly enforce the use of the null keyword. v2.2 does not support empty comma segments.
- Correct: `=1,null,true`
- Incorrect: `=1,,true`

#### D. Quoting Rules
- **Unquoted**: Single words with no delimiters (`Alice`, `123`, `true`).
- **Quoted**: Strings with spaces, commas or special characters (`"New York"`, `"Alice, Bob"`, `"john@email.com"`).
- **Triple-Quoted**: Multiline text (`"""Line1\nLine2"""`).

<br>

## 6. Error Validation

The LLM should detect and report positional mismatches:
- **Input**: `# (id:number, name:string)`
- **Data**: `=1,Alice,ExtraValue`
- **Expected Output**: `Error: Field count mismatch. Expected 2, found 3.`

<br>

## License
[MIT](./LICENSE) License

© 2025-Present [M B Parvez](https://www.mbparvez.me)