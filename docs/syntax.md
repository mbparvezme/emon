# EMON Syntax Guide

**EMON (Efficient Modular Object Notation)** is a schema-driven, positional, plain-text data format. It eliminates structural redundancy by defining fields once in a schema and assigning values by position in data records.

---

## File Structure

Every EMON file must follow this strict top-to-bottom order:

```
1. Directives       @version(...), @encoding(...), etc.
2. Imports          import "..."
3. Named Types      #name(...)
4. Root Schema      #(...)  or  #(...)[]
5. Data Records     =value,value,...
```

Sections that are not needed may be omitted, but the order must never be reversed. For example, a named type cannot appear after the root schema, and an import cannot appear after a directive.

---

## 1. Directives

Directives are optional file-level metadata declarations. They must appear at the very top of the file, before anything else.

```emon
@version(1.0)
@encoding(utf-8)
@lang(en)
```

- Each directive uses the format `@name(value)`.
- Directive names are lowercase identifiers.
- Multiple directives are allowed, each on its own line.
- If `@version` is omitted, the parser defaults to the latest supported version.
- Unknown directives are reserved for future use and must not cause a parse error.

---

## 2. Imports

Imports allow reusing named type definitions from external EMON files. They must appear after directives and before any type definitions.

```emon
import "./types/address.emon"
import "https://example.com/schemas/user.emon"
```

- Both relative file paths and full URLs are supported.
- The import path must be a quoted string.
- Imported named types become available as if defined in the current file.
- Circular imports are not supported.
- Only named type definitions are imported. Root schemas and data records from imported files are ignored.

---

## 3. Named Type Definitions

Named types define reusable structures for nested objects. They must be defined before the root schema.

```emon
#address(street:string,city:string,country:string)
#skill(name:string,level:string)
```

- Named types use the format `#name(field_list)`.
- The name must start with a letter and contain only letters, digits, and underscores.
- Named types cannot use the `[]` suffix. That suffix is reserved for the root schema only.
- Named types cannot reference themselves (no circular references).
- Named types defined in the same file are available to the root schema and to each other (forward references are allowed).

---

## 4. Root Schema

The root schema defines the primary data structure of the file. It must appear after all named types and before data records.

```emon
#(id:number,name:string,email:string)
```

For an array of records:

```emon
#(id:number,name:string,email:string)[]
```

- The root schema is **nameless** — it uses `#(` directly with no type name.
- Each file must have exactly one root schema.
- The `[]` suffix means the file represents an array of records. Without it, the file represents a single object.
- Field order in the schema is the positional contract for all data records.

---

## 5. Data Records

Data records assign values to the fields declared in the root schema.

```emon
=1,Alice,"alice@example.com"
=2,"M. Hasan","hasan@example.com"
```

- Each record starts with `=` followed by comma-separated values.
- Values must follow the **exact field order** defined in the root schema.
- Each `=` line represents one record.
- No spaces are allowed around commas or inside structures.

---

## Field Types

| Type | Description | Example |
|---|---|---|
| `string` | Text value. Quoted when needed. | `Alice`, `"M. Hasan"` |
| `number` | Integer or float. | `42`, `3.14`, `+10`, `-7` |
| `bool` | Boolean. Only `true` or `false`. | `true`, `false` |
| `string[]` | Array of strings. | `[admin,editor]` |
| `number[]` | Array of numbers. | `[1,2,3]` |
| `bool[]` | Array of booleans. | `[true,false]` |
| `#type` | Reference to a named type (nested object). | `{Alice,Lead}` |
| `#type[]` | Array of named type instances. | `[{Alice,Lead},{Bob,Dev}]` |
| `(field_list)` | Inline anonymous type (non-reusable). | `[(name:string,qty:number)]` |
| `(field_list)[]` | Array of inline type instances. | `[{Mug,2},{Pen,5}]` |

---

## Rules

### Rule 1 — Field Definition

Fields are declared as `name:type` inside a schema.

```emon
#(id:number,name:string,active:bool)
```

- Field names must start with a letter and contain only letters, digits, and underscores.
- Field names and type names are case-sensitive.
- No spaces are allowed around `:` or `,` in field definitions.

---

### Rule 2 — Optional Fields

A field can be marked optional with `?` after its name.

```emon
#(id:number,name:string,bio?:string,website?:string)
```

- Optional fields must appear at the **end** of the field list.
- You cannot place an optional field before a required field.
- In a data record, optional fields at the end of a record may be omitted entirely. The parser assigns `null` to omitted optional fields automatically.
- If an optional field is not the last field, or if a required field follows it, `null` must be written explicitly.

```emon
#(id:number,name:string,bio?:string,website?:string)
=1,Alice                          // bio and website are both null
=2,Bob,"A developer"              // website is null, bio is provided
=3,Carol,"Designer","carol.dev"   // all fields provided
```

---

### Rule 3 — Quotation

- Strings containing **only letters, digits, and underscores** do not need quotes.
- Strings containing **spaces, commas, or any special character** (except `_`) must be quoted with double quotes.

```emon
#(full_name:string,username:string,email:string)
="M. Hasan",md_hasan,"hasan@example.com"   // ✅ Correct
=M. Hasan,md_hasan,"hasan@example.com"     // ❌ Full name must be quoted
="M. Hasan","md_hasan","hasan@example.com" // ❌ Username should not be quoted
```

---

### Rule 4 — Null Values

Use the keyword `null` to represent a missing or undefined value.

```emon
#(id:number,name:string,bio:string)
=1,Alice,null     // ✅ bio is explicitly null
=2,Bob,,          // ❌ Empty segments are not allowed
```

- `null` is a reserved literal. It is never treated as a string.
- To store the text `"null"` as a string value, it must be quoted: `"null"`.
- Empty comma segments (`,,`) are not valid.

---

### Rule 5 — Numbers

```emon
#(score:number,temperature:number,offset:number)
=42,3.14,+10
=-7,-0.5,+100
```

- Integers and floats are both valid.
- A leading `+` or `-` sign is allowed.
- Numbers must not be quoted. `"42"` in a `number` field is a type error.

---

### Rule 6 — Inline Type Definitions

For simple nested structures that do not need to be reused, you can define the type directly inside the field declaration using parentheses.

```emon
#(id:string,items:[(name:string,qty:number,price:number)])
=ABC-001,[{Mug,2,12.50},{Pen,5,1.99}]
```

- Inline types use the format `(field_list)` or `(field_list)[]`.
- Inline types are anonymous and cannot be referenced by name elsewhere.
- Inline types cannot be nested recursively inside another inline type beyond what is necessary.

---

### Rule 7 — Arrays

Arrays use `[]` and are always homogeneous (all elements must be the same type).

```emon
[admin,editor]            // string array
[1,2,3]                   // number array
[true,false,true]         // bool array
[{Alice,Lead},{Bob,Dev}]  // array of named type instances
```

- No spaces inside arrays.
- No index syntax — arrays are position-based.
- Mixed-type arrays are not allowed: `[1,true,"A"]` ❌

---

### Rule 8 — Tuples (Nested Object Instances)

Tuples use `{}` to represent an instance of a named or inline type.

```emon
#address(city:string,country:string)
#(name:string,location:#address)
=Alice,{London,UK}
```

- Values inside `{}` follow the field order of the referenced type.
- No spaces inside tuples.
- Tuples are not key-value maps — they are strictly positional.

---

### Rule 9 — Spacing

No spaces are allowed inside structures. This applies to schemas, arrays, tuples, and data records.

```emon
// ✅ Correct
#(id:number,name:string)
=[{Alice,Lead},{Bob,Dev}]

// ❌ Incorrect
#( id : number, name : string )
= [ { Alice, Lead }, { Bob, Dev } ]
```

---

### Rule 10 — Comments

EMON supports two comment styles.

**Single-line:**
```emon
// This is a single-line comment
#(id:number,name:string)
```

**Multi-line:**
```emon
/*
  This schema defines a user record.
  Fields: id, name, email.
*/
#(id:number,name:string,email:string)
```

- Comments may appear anywhere in the file except inside a data record (`=` line) or inside a schema definition line.
- Inline comments at the end of a `=` line are **not allowed** and will break parsing.

```emon
=1,Alice,true    // ❌ Inline comment on a data record — not allowed
```

---

### Rule 11 — Escape Sequences

Inside quoted strings, the following escape sequences are supported:

| Sequence | Meaning |
|---|---|
| `\"` | Literal double quote |
| `\\` | Literal backslash |
| `\n` | Newline |
| `\t` | Tab |
| `\r` | Carriage return |

```emon
#(message:string)
="He said \"Hello\" to me."
```

---

### Rule 12 — Multiline Strings

Use triple double-quotes (`"""`) for strings that span multiple lines.

```emon
#(title:string,body:string)
="Release Notes","""
Fixed critical bug in auth flow.
Improved performance by 30%.
"""
```

- All internal line breaks and whitespace are preserved exactly as written.
- Multiline strings can appear anywhere a regular string value is expected.

---

### Rule 13 — Root Schema Array vs Object

- `#(...)` → the file represents a **single object**.
- `#(...)[]` → the file represents an **array of objects**, with one record per `=` line.

```emon
// Single object — one = line expected
#(id:number,name:string)
=1,Alice

// Array of objects — multiple = lines allowed
#(id:number,name:string)[]
=1,Alice
=2,Bob
```

---

### Rule 14 — One Root Schema Per File

Each EMON file must have exactly one root schema (`#(...)`). Multiple named types are allowed, but only one nameless root.

---

### Rule 15 — Reserved Identifiers

Field names and type names prefixed with `_` (e.g., `_checksum`, `_source`) are reserved for future parser-level metadata. They are not valid in the current version of EMON and will be rejected by the parser.

---

## Strict Type Validation

Values must match the declared field type exactly.

| Field Type | Valid | Invalid |
|---|---|---|
| `number` | `42`, `3.14`, `+10` | `"42"`, `twenty` |
| `bool` | `true`, `false` | `"true"`, `1`, `yes` |
| `string` | `Alice`, `"M. Hasan"` | _(any quoted or bare string is valid)_ |

---

## Complete Example

```emon
@version(1.0)
@encoding(utf-8)

import "./types/common.emon"

#skill(name:string,level:string)

#(id:number,name:string,email?:string,skills:#skill[])[]

=1,Alice,"alice@example.com",[{PHP,Expert},{JS,Intermediate}]
=2,Bob,null,[{Python,Advanced}]
=3,Carol
```

**Equivalent JSON:**

```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "skills": [
      { "name": "PHP", "level": "Expert" },
      { "name": "JS", "level": "Intermediate" }
    ]
  },
  {
    "id": 2,
    "name": "Bob",
    "email": null,
    "skills": [
      { "name": "Python", "level": "Advanced" }
    ]
  },
  {
    "id": 3,
    "name": "Carol",
    "email": null,
    "skills": null
  }
]
```

---

## Quick Reference

| Element | Syntax | Example |
|---|---|---|
| Directive | `@name(value)` | `@version(1.0)` |
| Import | `import "path"` | `import "./types/user.emon"` |
| Named type | `#name(fields)` | `#skill(name:string,level:string)` |
| Root schema | `#(fields)` or `#(fields)[]` | `#(id:number,name:string)[]` |
| Optional field | `name?:type` | `bio?:string` |
| Inline type | `(fields)` or `(fields)[]` | `[(name:string,qty:number)]` |
| Data record | `=values` | `=1,Alice,true` |
| Null value | `null` | `=1,null,active` |
| Single-line comment | `// text` | `// User records` |
| Multi-line comment | `/* text */` | `/* schema notes */` |
| Quoted string | `"text"` | `"New York, USA"` |
| Multiline string | `"""text"""` | `"""line1\nline2"""` |
| Tuple instance | `{values}` | `{Alice,Lead}` |
| Array instance | `[values]` | `[admin,editor]` |
