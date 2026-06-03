# EMON Schema

This folder contains the **official schema definitions for EMON (Efficient Modular Object Notation)**. Each version is stored in its own subfolder for backward compatibility.

---

## Versions

| Version | Status | Notes |
|---|---|---|
| [0.1.0](./0.1.0/) | Stable | Initial release |
| [0.2.0](./0.2.0/) | Current | Added directives, imports, optional fields, inline types, multi-line comments, signed numbers, and security directives |

---

## Files (per version)

Each version folder contains three files that together define the complete EMON specification:

| File | Purpose |
|---|---|
| `index.ebnf` | Formal grammar specification using Extended Backus-Naur Form (EBNF). Defines all syntax rules, identifiers, types, values, arrays, and tuples. |
| `index.json` | Machine-readable schema for validators, parsers, and IDE extensions. |
| `index.emon` | Human-readable self-descriptive schema written in EMON itself. Mirrors the EBNF and JSON schema. |

---

## What Changed in 0.2.0

| Feature | Description |
|---|---|
| Generic directives | `@name(value)` pattern supports `@version`, `@encoding`, `@lang`, and future directives |
| Imports | `import "..."` reuses named types from file paths and URLs |
| Optional fields | Field marker `?` allows fields to be omitted from the end of a record |
| Inline type definitions | Anonymous types defined directly within a field type |
| Multi-line comments | `/* ... */` block comments added alongside single-line `//` |
| Signed numbers | Leading `+` or `-` allowed on integers and floats |
| Split definitions | `definition` split into `named_definition` and `root_definition` for clarity |
| Updated `bare_string` | Only letters, digits, and underscore allowed — delimiter characters now rejected |
| Clarified escape sequences | Five explicit escape rules with comments — duplicate rule removed |
| `field_type` grouping | Parentheses added to remove ambiguity in array suffix application |
| `schema_hash` directive | Document-level integrity check — planned for next parser release |
| `reserved_field` | Underscore-prefixed identifiers reserved for future metadata extensions |
| `document` definition | High-level document structure formally described, enforcing strict section order |

---

## Usage

### Referencing the Schema in EMON Files

The `@version` directive declares the EMON format version using a `major.minor` value:

```emon
@version(1.0)
#(id:number,name:string,email?:string)
=1,Alice,"alice@example.com"
=2,Bob,null
```

### For Developers

- Use `index.ebnf` to build parsers or understand the formal grammar
- Use `index.json` for IDE extensions, validators, and tooling
- Use `index.emon` as a self-descriptive human-readable reference

### For AI Tools and LLMs

- Use `index.emon` alongside `docs/syntax.md` and `docs/example.md` for context injection
- The schema files describe every construct an LLM needs to correctly parse and generate EMON

---

## Versioning Policy

- Each version is stored in its own subfolder (e.g., `0.1.0/`, `0.2.0/`)
- Once published, a version folder is frozen — its files are never modified
- New features are released in a new version folder following the append-only field strategy described in the EMON specification

---

## Links

- [Syntax Guide](../docs/syntax.md)
- [Examples](../docs/example.md)
- [LLM Training Guide](../docs/llm-training.md)
- [Main Repository](https://github.com/mbparvezme/emon)
