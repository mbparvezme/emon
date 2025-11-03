# EMON Schema 1.0

This folder contains the **official EMON (Efficient Modular Object Notation) schema version 1.0**. It provides all necessary references for developers, parsers, and IDEs.

## Files

* `index.ebnf` – Defines the **grammar rules** of EMON (syntax, identifiers, types, values, objects, arrays, references).
* `index.json` – **Machine-readable JSON schema** for validators, tools, and IDE support.
* `index.emn` – **Human-readable EMON schema**, self-descriptive and matches EBNF and JSON schema.

## Usage

### EMON Data Files

When creating EMON files, you can reference the schema for clarity:

```emn
$schema: "https://mbparvezme.github.io/emon/schema/1.0"

#user:name:string,age:number,verified:bool
=Parvez,30,true
```

### Tools & Validation

* Use `index.json` for JSON schema validation tools.
* Use `index.ebnf` to build syntax parsers or IDE extensions.
* Use `index.emn` as a reference for developers to understand EMON rules.

## Versioning

* All schema versions are stored in subfolders (e.g., `1.0/`).
* Future versions can be added (e.g., `2.0/`) without breaking existing files.

This folder is intended to help **developers, AI tools, and parsers** work consistently with EMON files.
