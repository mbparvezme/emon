# Comparison With JSON

This document compares **EMON (Efficient Modular Object Notation)** with **JSON**, showing how EMON improves AI performance, human readability, and data efficiency.

<br>

## Overview

JSON is universal, but EMON introduces **explicit typing**, **modular design**, and **compact representation**, making it ideal for AI and ML pipelines that need predictable, low-token structures.

<br>

## Key Differences

| Feature         | EMON Format                           | JSON                      |
| --------------- | ------------------------------------- | ------------------------- |
| Readability     | High, concise for humans              | Verbose                   |
| Type Hints      | Explicit (`string`, `number`, `bool`) | Implicit                  |
| Nested Objects  | Defined using reusable `#type`        | Inline `{}`               |
| Arrays          | `[val1, val2]`                        | `[val1, val2]`            |
| Comments        | Not supported inside values           | Not supported             |
| AI-Friendliness | Directly parseable                    | Needs schema or inference |

<br>

## Example

Below are some examples with various rules and data structure.

### Example 1 – Simple Object

**EMON:**
```emon
#user(id:number,name:string,roles:[string])
=1,"M Alice",[admin,editor]
```

**Equivalent JSON:**
```json
{
  "id": 1,
  "name": "M Alice",
  "roles": ["admin", "editor"]
}
```

**Rule:**  
`#type(...)` → represents a single JSON object.

---

### Example 2 – Array of Objects

**EMON:**
```emon
#user(id:number,name:string)[]
=1,Alice
=2,Bob
```

**Equivalent JSON:**
```json
[
  { "id": 1, "name": "Alice" },
  { "id": 2, "name": "Bob" }
]
```

**Rule:**  
`#type(...)[]` → represents an array of JSON objects.



### Example 3 – Nested Object

**EMON:**
```emon
#user(id:number,name:string,profile:#profile)
#profile(age:number,city:string)
=1,Alice,{25,NY}
```

**Equivalent JSON:**
```json
{
  "id": 1,
  "name": "Alice",
  "profile": { "age": 25, "city": "NY" }
}
```

**Rule:**  
`#field:#type` → embeds another object type inside.


### Example 4 – Array of Nested Objects

**EMON:**
```emon
#project(name:string,members:#member[])
#member(name:string,role:string)
="AI Dev",[{Parvez,Lead},{Rafi,Engineer}]
```

**Equivalent JSON:**
```json
{
  "name": "AI Dev",
  "members": [
    { "name": "Parvez", "role": "Lead" },
    { "name": "Rafi", "role": "Engineer" }
  ]
}
```

**Rule:**  
`#field:#type[]` → array of nested object types.


### Example 5 – Inline Nested Type

**EMON:**
```emon
#order(id:number,item:(name:string,price:number))
=1,({Pen,5})
```

**Equivalent JSON:**
```json
{
  "id": 1,
  "item": { "name": "Pen", "price": 5 }
}
```

**Rule:**  
Inline `( ... )` works as a quick nested type.


### Example 6 – Array of Primitive Types

**EMON:**
```emon
#tags(list:[string])
=[AI,Data,Compact]
```

**Equivalent JSON:**
```json
{ "list": ["AI", "Data", "Compact"] }
```

**Rule:**  
`[string]` → array of primitive values.

<br>

### When to Use

* AI training datasets and structured prompts.
* Human-readable config and prototype data.
* JSON for interoperability with external APIs.

<br>

### Summary

* **EMON:** Concise, type-safe, and AI-optimized.
* **JSON:** Standard and universal but verbose.
* Both accurately represent structured data - EMON just does it more efficiently.