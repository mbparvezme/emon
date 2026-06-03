# EMON Guide for LLMs

This document is the complete reference for teaching a Large Language Model (LLM) to read, generate, convert, and validate **EMON (Efficient Modular Object Notation)**. It contains every syntax rule, the data model, conversion logic, and worked examples needed for an AI tool, fine-tuning dataset, custom GPT, or agent skill to operate on EMON correctly.

If you are building a tool on top of this file, treat the rules in the "Core Rules" and "Validation" sections as strict — they define correct behavior.

---

## 1. What EMON Is

EMON is a schema-driven, positional, plain-text data format. It defines field names once in a schema, then stores values by position in data records. This removes the repeated keys, quotes, and braces that make JSON verbose.

The same data in JSON and EMON:

**JSON**
```json
[
  { "id": 1, "name": "Alice", "active": true },
  { "id": 2, "name": "Bob", "active": false }
]
```

**EMON**
```emon
#(id:number,name:string,active:bool)[]
=1,Alice,true
=2,Bob,false
```

The schema line `#(...)` is written once. Each `=` line is one record. Field order in the schema is the contract: the first value maps to the first field, the second to the second, and so on.

---

## 2. Why EMON Helps LLMs

- **Token efficiency**: Removing repeated keys and punctuation makes EMON payloads roughly 40–70% smaller in tokens than JSON. More data fits in the context window, and inference costs drop.
- **Positional focus**: Because keys are not repeated per record, the model attends to values instead of re-parsing structural markers on every row.
- **Deterministic structure**: A single schema line governs every record, which makes generation and validation predictable.

---

## 3. The EMON Data Model

EMON maps cleanly to the JSON data model. Every EMON document resolves to either a single object or an array of objects.

| EMON construct | Resolves to |
|---|---|
| `#(...)` root | A single JSON object |
| `#(...)[]` root | A JSON array of objects |
| primitive value | string, number, or boolean |
| `null` | JSON null |
| `[...]` | JSON array |
| `{...}` | JSON object (positional, mapped to a named or inline type) |

There are only three primitive types: `string`, `number`, `bool`. Everything else is built from arrays (`[]`), named types (`#type`), and inline types (`(...)`).

---

## 4. File Structure (Strict Order)

An EMON file must follow this top-to-bottom order. Any section may be omitted, but the order must never change.

```
1. Directives       @version(...), @encoding(...)
2. Imports          import "..."
3. Named types      #name(...)
4. Root schema      #(...)  or  #(...)[]
5. Data records     =value,value,...
```

A complete file using every section:

```emon
@version(1.0)
@encoding(utf-8)

import "./types/address.emon"

#skill(name:string,level:string)

#(id:number,name:string,location:#address,skills:#skill[])[]

=1,Alice,{London,UK},[{PHP,Expert},{JS,Intermediate}]
=2,Bob,{Dhaka,Bangladesh},[{Python,Advanced}]
```

---

## 5. Core Rules

A model generating or validating EMON must follow all of these.

### 5.1 Root schema
- Exactly one nameless root schema per file, written as `#(...)`.
- `#(...)` means the file is a single object. `#(...)[]` means the file is an array of objects.
- The root must come after all named types and before all data records.

### 5.2 Named types
- Declared as `#name(field_list)` and used for nested objects.
- Named types must **not** use the `[]` suffix in their definition. (Arrays are expressed at the point of use, e.g. `skills:#skill[]`.)
- Named types must be declared before the root schema.
- Circular references are not allowed.

### 5.3 Field definitions
- Written as `name:type`.
- Names start with a letter and contain only letters, digits, and underscores.
- Field and type names are case-sensitive.

### 5.4 Suffix array notation
- Arrays use the `type[]` suffix: `string[]`, `number[]`, `bool[]`, `#skill[]`.
- Do **not** use a prefix form like `[string]`.
  - Correct: `roles:string[]`
  - Incorrect: `roles:[string]`

### 5.5 Optional fields
- Mark optional fields with `?` after the name: `email?:string`.
- Optional fields must appear at the **end** of the field list, never before a required field.
- In a record, trailing optional fields may be omitted entirely; the parser fills them with `null`.

```emon
#(id:number,name:string,bio?:string,website?:string)[]
=1,Alice                          // bio and website become null
=2,Bob,"A developer"              // website becomes null
=3,Carol,"Designer","carol.dev"   // all fields present
```

### 5.6 Quoting
- Bare (unquoted) strings may contain **only** letters, digits, and underscores, and must start with a letter: `Alice`, `md_asad`.
- Quote a string if it contains spaces, commas, or any special character other than `_`: `"New York, USA"`, `"john@email.com"`.

### 5.7 Numbers
- Integers and floats are valid. A leading `+` or `-` sign is allowed: `42`, `3.14`, `+10`, `-7`.
- Numbers in a `number` field are never quoted. `"42"` is a type error there.

### 5.8 Booleans
- Only `true` or `false`, unquoted.

### 5.9 Null
- Use the keyword `null` for a missing value.
- `null` is never a string. To store the literal text "null", quote it: `"null"`.
- Empty comma segments are invalid: `=1,,active` is wrong; use `=1,null,active`.

### 5.10 Arrays
- Homogeneous (all elements the same type) and position-based.
- An empty array is `[]`. This is different from `null`.

### 5.11 Tuples
- `{...}` represents one instance of a named or inline type.
- Values inside `{}` follow the field order of that type. Tuples are positional, not key-value maps.

### 5.12 Inline types
- A nested structure that is not reused can be defined inline: `items:[(name:string,qty:number)]`.
- Inline types are anonymous, non-reusable, and cannot be referenced by name.

### 5.13 Spacing
- No spaces around `:` or `,`, and no spaces inside `()`, `[]`, or `{}`.
  - Correct: `=[{Alice,Lead},{Bob,Dev}]`
  - Incorrect: `= [ { Alice, Lead }, { Bob, Dev } ]`

### 5.14 Comments
- Single-line: `// comment`
- Multi-line: `/* comment */`
- Comments may sit between elements but **never** inside a `=` record line or a schema definition line. An inline comment on a record breaks parsing.

### 5.15 Escape sequences (inside quoted strings)
`\"` (quote), `\\` (backslash), `\n` (newline), `\t` (tab), `\r` (carriage return).

### 5.16 Multiline strings
- Use triple quotes `"""..."""`. All line breaks and whitespace are preserved exactly.

### 5.17 Reserved identifiers
- Names beginning with `_` (e.g. `_checksum`) are reserved for future use and are invalid now.

---

## 6. Reading EMON (EMON → JSON)

To convert an EMON document to JSON, an LLM should:

1. Read directives and imports (imports bring in named type definitions).
2. Collect all named type definitions and store their field order.
3. Read the root schema and its field order. Note whether it ends in `[]`.
4. For each `=` record:
   - Split top-level values by commas, respecting quotes, `[]`, and `{}` nesting.
   - Map each value to the corresponding field by position.
   - For `#type` fields, expand the `{...}` tuple using that type's field order.
   - For `type[]` fields, expand each element of the `[...]` array.
   - Fill omitted trailing optional fields with `null`.
5. If the root ended in `[]`, output a JSON array; otherwise a single object.

**Worked example**

```emon
#skill(name:string,level:string)
#(id:number,name:string,skills:#skill[])[]
=1,Alice,[{PHP,Expert},{JS,Intermediate}]
```

Steps: `#skill` has fields `(name, level)`. Root has `(id, name, skills)` and ends in `[]`. The record's third value is an array of `#skill` tuples.

Result:
```json
[
  {
    "id": 1,
    "name": "Alice",
    "skills": [
      { "name": "PHP", "level": "Expert" },
      { "name": "JS", "level": "Intermediate" }
    ]
  }
]
```

---

## 7. Generating EMON (JSON → EMON)

To convert JSON to EMON, an LLM should:

1. Decide the root: a JSON array of objects → `#(...)[]`; a single object → `#(...)`.
2. Infer the schema from the keys of the first (or a merged) object, in order.
   - Map JSON string → `string`, number → `number`, boolean → `bool`.
   - Arrays of primitives → `string[]` / `number[]` / `bool[]`.
   - Nested objects → define a named type `#name(...)` and reference it, or use an inline type for one-off structures.
   - Arrays of objects → `#name[]`.
3. Place fields that are often null at the end and mark them with `?`.
4. Emit named types first, then the root schema, then one `=` record per object, assigning values in field order.
5. Apply quoting rules and use `null` for missing values.

**Worked example**

Input:
```json
{ "user": "Parvez", "score": 95, "roles": ["admin", "editor"] }
```

Output:
```emon
#(user:string,score:number,roles:string[])
=Parvez,95,[admin,editor]
```

---

## 8. Fine-Tuning Dataset Formats

Use instruction-style records. Recommended task types:

**EMON → JSON**
```json
{
  "instruction": "Convert this EMON document to JSON.",
  "input": "#(user:string,score:number)\n=Parvez,95",
  "output": "{\"user\": \"Parvez\", \"score\": 95}"
}
```

**JSON → EMON**
```json
{
  "instruction": "Convert this JSON to EMON.",
  "input": "{\"name\": \"Alice\", \"roles\": [\"admin\"]}",
  "output": "#(name:string,roles:string[])\n=Alice,[admin]"
}
```

**Schema inference**
```json
{
  "instruction": "Generate the EMON schema for this data.",
  "input": "{\"name\": \"Alice\", \"roles\": [\"admin\"]}",
  "output": "#(name:string,roles:string[])"
}
```

**Data extraction**
```json
{
  "instruction": "From the EMON document, return the name of every record where active is true.",
  "input": "#(id:number,name:string,active:bool)[]\n=1,Alice,true\n=2,Bob,false",
  "output": "[\"Alice\"]"
}
```

**Validation**
```json
{
  "instruction": "Validate this EMON record against its schema. Report any error.",
  "input": "#(id:number,name:string)\n=1,Alice,Extra",
  "output": "Error: field count mismatch. Schema defines 2 fields, record has 3."
}
```

Cover these categories across the dataset: primitive roots, suffix arrays, named-type nesting, inline types, optional/omitted fields, explicit nulls, quoting edge cases, multiline strings, and directives/imports.

---

## 9. Validation Rules

A model checking EMON correctness should detect:

- **Field count mismatch**: record has more values than the schema has fields (after accounting for omitted trailing optional fields).
  - Schema `#(id:number,name:string)` + record `=1,Alice,Extra` → error: expected 2, found 3.
- **Type mismatch**: a value does not match its field type.
  - `#(age:number)` + `=twenty` → error: `age` expects number.
  - `bool` field given anything other than `true`/`false`.
- **Empty segment**: `,,` in a record → error: use explicit `null`.
- **Optional ordering**: a required field placed after an optional field in the schema → error.
- **Named type with `[]` in its definition**: → error: arrays are expressed at point of use.
- **Multiple root schemas** (more than one nameless `#(...)`) → error.
- **Inline comment on a record line** → error.
- **Bare string with illegal characters** (space, comma, special char) → error: must be quoted.

---

## 10. Common Mistakes to Avoid

| Mistake | Wrong | Correct |
|---|---|---|
| Prefix array | `roles:[string]` | `roles:string[]` |
| Empty segment | `=1,,true` | `=1,null,true` |
| Spaces in structure | `= [ {Alice} ]` | `=[{Alice}]` |
| Quoting a bare word | `="Alice"` (no special chars) | `=Alice` |
| Unquoted special string | `=New York` | `="New York"` |
| Named type with suffix | `#skill(...)[]` | `#skill(...)` then `#skill[]` at use |
| Inline comment on record | `=1,Alice // note` | `// note` on its own line above |
| Optional before required | `#(a?:string,b:number)` | `#(b:number,a?:string)` |

---

## 11. Quick Reference

| Element | Syntax | Example |
|---|---|---|
| Directive | `@name(value)` | `@version(1.0)` |
| Import | `import "path"` | `import "./types/user.emon"` |
| Named type | `#name(fields)` | `#skill(name:string,level:string)` |
| Root (object) | `#(fields)` | `#(id:number,name:string)` |
| Root (array) | `#(fields)[]` | `#(id:number,name:string)[]` |
| Optional field | `name?:type` | `email?:string` |
| Inline type | `(fields)` / `(fields)[]` | `[(name:string,qty:number)]` |
| Record | `=values` | `=1,Alice,true` |
| Null | `null` | `=1,null,active` |
| Primitive array | `type[]` | `roles:string[]` |
| Named array | `#type[]` | `skills:#skill[]` |
| Tuple | `{values}` | `{Alice,Lead}` |
| Array | `[values]` | `[admin,editor]` |
| Quoted string | `"text"` | `"New York, USA"` |
| Multiline string | `"""text"""` | `"""line1\nline2"""` |
| Line comment | `// text` | `// users` |
| Block comment | `/* text */` | `/* notes */` |

---

## License

[MIT](./LICENSE) License

© 2025–Present [M B Parvez](https://www.mbparvez.me)
