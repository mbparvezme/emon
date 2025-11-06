# Syntax Guide

This document explains the full syntax used in **EMON (Efficient Modular Object Notation)**.
Understanding these rules ensures clean, consistent, and AI-friendly data files.

<br>

## Core Syntax

* **Type Declaration**: Begin with `#` to define a type and its fields.

  ```emon
  #type_name(field:type,...)
  ```

  Example:

  ```emon
  #user(id:number,name:string,gender:string,roles:[string])
  ```

* **Value Assignment**: Use `=` to provide values in the same order as the fields.

  ```emon
  =1,A,female,[admin,editor]
  ```

* **Nested Structures**: Define nested objects or arrays explicitly.

  ```emon
  #project(name:string,members:#member[])
  #member(name:string,role:string)
  =AI_Dev,[{Alice,Lead},{Bob,Engineer}]
  ```

<br>

## Field Types

| Type     | Description                          | Example                  |
| -------- | ------------------------------------ | ------------------------ |
| `string` | Text values; quotes only when needed | `"M Parvez"` or `Parvez` |
| `number` | Integer or float values              | `42`, `3.14`             |
| `bool`   | Boolean values                       | `true`, `false`          |
| `[type]` | Array of a single type               | `[admin,editor]`         |
| `#type`  | Reference to another defined type    | `{PHP,Expert}`           |

<br>

## Rules

1. **Type Definition**  
   - Always define types before using them.  
   - Field names and type names are case-sensitive.

2. **Object vs Array**  
   - `#type(...)` → single JSON object `{...}`  
   - `#type(...)[]` → array of objects `[{...}, {...}]`

3. **Value Assignment**  
   - Each `=` line represents **one record**.  
   - Values must follow the **exact field order**.  

4. **Quotation**  
   - Single-word strings → no quotes (`Alice`, `Admin`)  
   - Multi-word or special strings → use double quotes (`"M Alice"`, `"NY, USA"`)

5. **Spacing**  
   - No unnecessary spaces inside structures.  
   - Correct: `=[{Alice},{Bob}]`  
   - Incorrect: `= [ { Alice }, { Bob } ]`

6. **Nested Types**  
   - Use `{}` for objects, `[]` for arrays of primitives or objects.  
   - Arrays of objects: `#type[]`  
   - Inline nested type (optional): `(name:string,price:number)`

7. **Primitive Types**  
   - `string`, `number`, `bool`  
   - Arrays: `[type]`  
   - Nested object: `#type`

8. **Comments**  
   - Use `//` **outside** data lines.  
   - Inline comments inside `=` lines or type definitions are **not allowed**.

9. **Escaping & Special Strings**  
   - Use `\` for special characters: `"He said \"Hello\""`  
   - Multi-line strings: triple quotes  
     ```emon
     #note(text:string)
     ="""Line 1
     Line 2"""
     ```

10. **File Header (Optional)**  
    - Meta information at the top:  
      ```emon
      @version(1.0)
      @encoding(utf-8)
      ```

11. **Strict Type Validation**  
    - Values must match declared types exactly:  
      - `#user(age:number)` → `=25` ✅  
      - `=twenty-five` ❌

12. **Array Rules**  
    - Arrays are **position-based**, no indexes required: `[A,B,C]`  
    - Arrays must be homogenous in type.

13. **Importing Types**  
    - Reuse types across files using:  
      ```emon
      import "./common/user.emon"
      ```

14. **Single Root Type per File**  
    - Each file should have one main root type; others as helper types.

<br>

## Best Practices

1. Keep field order consistent across types and values.  
2. Avoid circular references between types.  
3. Use clear, descriptive field names.  
4. Maintain human readability while keeping compact format.  
5. Always test nested structures to ensure correct parsing.  
6. Keep arrays homogenous.  
7. Use modular types for reusability.  
8. Prefer importing shared types over redefining.  
9. Comment only outside data lines using `//`.  
10. Keep files focused on one main root type for clarity.

<br>

## Example

```emon
#employee(id:number,name:string,gender:string,skills:#skill[])
#skill(name:string,level:string)
=1,Parvez,male,[{PHP,Expert},{JS,Intermediate}]
```

**Equivalent JSON:**

```json
{
  "id": 1,
  "name": "Parvez",
  "gender": "male",
  "skills": [
    { "name": "PHP", "level": "Expert" },
    { "name": "JS", "level": "Intermediate" }
  ]
}
```

<br>

## Notes

* Maintain readability for humans while being AI-parsable.
* Ideal for training datasets, configurations, or structured AI input.