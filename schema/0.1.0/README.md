# EMON Schema 0.1.0
This folder contains the **official EMON (Efficient Modular Object Notation) schema version 0.1.0**. It provides all necessary references for developers, parsers, and IDEs.
---

<br>

## Files
* <a href="https://github.com/mbparvezme/emon/blob/main/schema/1.0/index.ebnf" target="_blank">`index.ebnf`</a> – Defines the **grammar rules** of EMON (syntax, identifiers, types, values, objects, arrays, references).
* <a href="https://github.com/mbparvezme/emon/blob/main/schema/1.0/index.json" target="_blank">`index.json`</a> – **Machine-readable JSON schema** for validators, tools, and IDE support.
* <a href="https://github.com/mbparvezme/emon/blob/main/schema/1.0/index.emon" target="_blank">`index.emon`</a>– **Human-readable EMON schema**, self-descriptive and matches EBNF and JSON schema.

<br>

## Usage
### EMON Data Files
When creating EMON files, you can reference the schema for clarity:

```emon
$schema: "https://mbparvezme.github.io/emon/schema/0.1.0"

#user:name:string,age:number,verified:bool
=Parvez,30,true
```

### Tools & Validation
* Use <a href="https://github.com/mbparvezme/emon/blob/main/schema/1.0/index.ebnf" target="_blank">`index.ebnf`</a> for JSON schema validation tools.
* Use <a href="https://github.com/mbparvezme/emon/blob/main/schema/1.0/index.json" target="_blank">`index.json`</a> to build syntax parsers or IDE extensions.
* Use <a href="https://github.com/mbparvezme/emon/blob/main/schema/1.0/index.emon" target="_blank">`index.emon`</a> as a reference for developers to understand EMON rules.

<br>

## Versioning
* All schema versions are stored in subfolders (e.g., `1.3.0/`).
* Future versions can be added (e.g., `2.0/`) without breaking existing files.

This folder is intended to help **developers, AI tools, and parsers** work consistently with EMON files.