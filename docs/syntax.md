# Syntax Guide

This document explains the full syntax used in **EMON (Efficient Modular Object Notation)**.
Understanding these rules ensures clean, consistent, and AI-friendly data files.

<br>

## Core Syntax

* **Type Declaration**: Begin with `#(` to define the primary root type and its fields.

  ```emon
  #(field:type,...)
  ```

  Example:

  ```emon
  #(id:number,name:string,gender:string,roles:[string])
  ```

* **Value Assignment**: Use `=` to provide values in the same order as the fields.

  ```emon
  =1,A,female,[admin,editor]
  ```

* **Nested Structures**: Define nested objects or arrays explicitly.

  ```emon
  #(name:string,members:#member[])
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

**1. Type Definition**
- Always define types before using them.  
- Field names and type names are case-sensitive.

**2. Object vs Array**  
- `#(...)` → single JSON object `{...}`  
- `#(...)[]` → array of objects `[{...}, {...}]`

**3. Value Assignment**  
- Each `=` line represents **one record**.  
- Values must follow the **exact field order**.  

**4. Quotation**  
- Single-word strings → no quotes (`Alice`, `Admin`)  
- Multi-word or special strings → use double quotes (`"M Alice"`, `"NY, USA"`)

**5. Spacing**
- No unnecessary spaces inside structures.  
- Correct: `=[{Alice},{Bob}]`  
- Incorrect: `= [ { Alice }, { Bob } ]`

**6. Nested Types**  
- Use `{}` for objects, `[]` for arrays of primitives or objects.  
- Arrays of objects: `#type[]`  
- Inline nested type (optional): `(name:string,price:number)`

**7. Primitive Types**  
- `string`, `number`, `bool`
- Arrays: `[type]`  
- Nested object: `#type`

**8. Comments**  
- Use `//` **outside** data lines.  
- Inline comments inside `=` lines or type definitions are **not allowed**.

**9. Escaping & Special Strings**  
- Use `\` for special characters: `"He said \"Hello\""`  
- Multi-line strings: triple quotes  
   ```emon
   #(text:string)
   ="""Line 1
   Line 2"""
   ```

**10. File Header (Optional)**: Meta information at the top:  
```emon
@version(1.0)
@encoding(utf-8)
```

**11. Strict Type Validation**  
- Values must match declared types exactly:  
- `#(age:number)` → `=25` ✅  
- `=twenty-five` ❌

**12. Array Rules**  
- Arrays are **position-based**, no indexes required: `[A,B,C]`  
- Arrays must be homogenous in type.

**13. Importing Types**: Reuse types across files using:  
```emon
import "./common/user.emon"
```

**14. Single Root Type per File**: Each file should have one main root type; others as helper types.

<br>

## Best Practices

Follow these guidelines to write clean, efficient, and valid EMON files.

**1. Keep Field Order Consistent**: Values must always follow the same order as defined in the type.
```emon
#(name:string,age:number,verified:bool)
=Parvez,30,true      // ✅ Correct
=true,Parvez,30      // ❌ Wrong (order mismatch)
```

**2. Avoid Circular References**: Types cannot reference each other in a loop.
```emon
#(a:#A)
#A(x:#X)    // ❌ Circular reference — not supported
#X(a:#A)    // ❌ Circular reference — not supported
```

**3. Use Clear, Descriptive Field Names**: Use meaningful field names instead of short or unclear ones.
```emon
#t(id:number,name:string,price:number)   // ✅ Good
#(i:n,n:s,p:n)                           // ❌ Avoid unclear abbreviations
```

**4. Maintain Human Readability with Compact Syntax**: Keep data compact but readable — don’t over-optimize spacing.
```emon
#profile(bio:string,location:string)
=Developer,"New York, USA"       // ✅ Clean and readable
= Developer , "New York, USA"    // ❌ Messy, unnecessary spaces
```

**5. Test Nested Structures**: Always verify deeply nested or referenced structures to ensure correct parsing.
```emon
#(name:string,members:#member[])
#member(name:string,role:string)
=Dev_Team,[{Alice,Lead},{Bob,Engineer}]  // ✅ Proper nesting
```

**6. Keep Arrays Homogenous**: All array elements must be of the same type.
```emon
[1,2,3]        // ✅ Valid
[1,true,"A"]   // ❌ Mixed types
```

**7. Use Modular Types for Reusability**: Define and reuse structures instead of repeating fields.
```emon
#user(name:string,age:number)
#(title:string,author:#user)
```
This makes files shorter and more maintainable.

**8. Import Shared Types**: Share definitions across files using `import`.
```emon
import "./common/user.emon"
#(text:string,author:#user)
```

**9. Comment Outside Data Lines**: Keep comments above or beside definitions - never inline with `=` records.
```emon
// User data records
=user1,30,true    // ✅ Allowed
=user2,25,false   // ❌ Inline comment breaks parsing
```

**10. Focus on One Root Type per File**: Each EMON file should define one main structure (root) for clarity.
```emon
#(...)
#skill(...)
```

**11. Avoid Extra Spaces and Braces**: Use consistent minimal syntax.
```emon
=[{Alice},{Bob}]           // ✅ Correct
= [ { Alice } , { Bob } ]  // ❌ Wrong
```

**12. Escape Special Characters in Strings**: Always escape quotes or special characters.
```emon
="He said \"Hello\""  // ✅
="He said "Hello""    // ❌
```

**13. Validate Data Types Strictly**: Every field must match the declared type.
```emon
#(age:number)
=25    // ✅
="25"  // ❌ Wrong type
```

> [!TIP]
> Keep EMON data modular, validated, and readable - your AI models and parsers will process it faster and more reliably.

<br>

## Example

```emon
#(id:number,name:string,gender:string,skills:#skill[])
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