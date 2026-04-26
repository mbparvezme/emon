# EMON Syntax Examples

**EMON (Efficient Minimal Object Notation)** is a compact, typed, and human-friendly data notation format designed as a minimal alternative to JSON. It prioritizes efficiency by using explicit schema lines (`#(...)`) and positional data records (`=value1,value2,...`), significantly reducing boilerplate characters.

These examples illustrate the core syntax principles of EMON:

- Schema Definition: Declaring types, fields, and nested structures.
- Data Records: Positional data entry matching the schema order.
- Quotation Rules: Omitting quotes for simple strings to achieve maximum conciseness.
- Nesting and Arrays: Using `{}` and `[]` for nested objects and lists.
- Multiline Strings: Defining large blocks of text using triple quotes (`"""`).

<br>

## 1. Basic Single Object (Primitive Types & Quoting)

This example shows a simple object structure, demonstrating the rules for quoting strings. Strings containing only letters, numbers, and `_-.@` are unquoted.

**EMON**

```emon
// Define the user type
#(id:number,username:string,email:string,isActive:bool)

// Data record follows the defined schema
=1001,JaneDoe,jane.doe@corp.com,true
```

**JSON Equivalent**

```json
{
  "id": 1001,
  "username": "JaneDoe",
  "email": "jane.doe@corp.com",
  "isActive": true
}
```

<br>

## 2. Array of Objects (Multiple Records)

To represent an array of objects, the root type declaration uses [] (e.g., #product(...)[]), and subsequent data records start with = until a new schema is declared.

**EMON**

```emon
// Define an array of products
#(sku:string,name:string,price:number,tags:string[])[]

// Record 1: Name without spaces (unquoted)
=SKU001,Apple,0.99,[fruit,fresh]

// Record 2: Name with a space (must be quoted)
=SKU002,"Orange Juice",3.45,[drink,packaged]
```

**JSON Equivalent**

```json
[
  {
    "sku": "SKU001",
    "name": "Apple",
    "price": 0.99,
    "tags": ["fruit", "fresh"]
  },
  {
    "sku": "SKU002",
    "name": "Orange Juice",
    "price": 3.45,
    "tags": ["drink", "packaged"]
  }
]
```

<br>

## 3. Nested Objects (Type References)

This demonstrates defining a child type (#location) separately and referencing it using #type in the parent schema (#person). Nested data is enclosed in {} and follows the child type's field order.

**EMON**

```emon
// Child type definition
#location(city:string,country:string)

// Parent type definition with a reference to #location
#(id:number,name:string,location:#location)[]

=201,John,{London,UK}
=202,"M Alice",{Paris,France}
```

**JSON Equivalent**

```json
[
  {
    "id": 201,
    "name": "John",
    "location": {
      "city": "London",
      "country": "UK"
    }
  },
  {
    "id": 202,
    "name": "M Alice",
    "location": {
      "city": "Paris",
      "country": "France"
    }
  }
]
```

Note: In this case, two records imply the root JSON structure is an array.

<br>

## 4. Array of Inline Nested Types

If a nested object is simple and unlikely to be reused, it can be defined inline within the schema using parentheses (...).

**EMON**

```emon
#(id:string,items:[(name:string,qty:number,price:number)])
// The items array contains inline nested objects: [{val1,val2,val3}, {val1,val2,val3}]
=ABC-456,[{Mug,2,12.50},{Pen,5,1.99}]
```

**JSON Equivalent**

```json
{
  "id": "ABC-456",
  "items": [
    {
      "name": "Mug",
      "qty": 2,
      "price": 12.50
    },
    {
      "name": "Pen",
      "qty": 5,
      "price": 1.99
    }
  ]
}
```

<br>

## 5. Multiline Text Block

The triple-quote ("""...""") syntax is used for multiline strings. All internal line breaks and white space are preserved exactly as written.

**EMON**

```emon
#(title:string,body:string)
="Q3 Summary", """
The third quarter performance exceeded expectations.
Key highlights include:
  - 15% growth in services.
  - Successful product launch.

We look forward to the next fiscal period.
"""
```

**JSON Equivalent**

```json
{
  "title": "Q3 Summary",
  "body": "The third quarter performance exceeded expectations.\n\nKey highlights include:\n  - 15% growth in services.\n  - Successful product launch.\n\nWe look forward to the next fiscal period.\n"
}
```

<br>

## 6. Null Values and Empty Arrays

Fields can be explicitly set to null. Arrays can be empty [] or explicitly null.

**EMON**

```emon
#(id:number,name:string,deadline:string,team:[string],notes:string)
// deadline is null, notes is an empty string (""), team is an empty array ([])
=10,Website-Redesign,null,[],""
```

**JSON Equivalent**

```json
{
  "id": 10,
  "name": "Website-Redesign",
  "deadline": null,
  "team": [],
  "notes": ""
}
```

<br>

## 7. Configuration Object with Deep Inline Nesting

Demonstrating inline type definition used for a complex, nested configuration structure.

**EMON**

```emon
#(name:string, settings:[(timeout:number, retry:[(max:number, delay:number)])])
=API-Client-1,[{15000, [{3, 500}, {5, 1000}]}]
```

**JSON Equivalent**

```json
{
  "name": "API-Client-1",
  "settings": [
    {
      "timeout": 15000,
      "retry": [
        { "max": 3, "delay": 500 },
        { "max": 5, "delay": 1000 }
      ]
    }
  ]
}
```

<br>

## 8. Mixed Quoting and Escaped Characters

A single record demonstrating all quoting rules: unquoted strings, quoted strings, and quotes escaped inside a quoted string.

**EMON**

```emon
#(user:string, timestamp:string, message:string)
// Timestamp contains spaces and must be quoted
// Message contains an internal double quote, which must be escaped as \"
=user-A,"2024-10-26 10:30","He said \"Hello\" to me."
```

**JSON Equivalent**

```json
{
  "user": "user-A",
  "timestamp": "2024-10-26 10:30",
  "message": "He said \"Hello\" to me."
}
```

<br>

## 9. Multiline Text Containing JSON

The multiline block can hold complex structured text, like a JSON snippet, preserving all formatting and line breaks.

**EMON**

```emon
#(source:string, payload:string)
=payment-processor, """
{
  "status": "fail",
  "reason": "Invalid card details",
  "code": 401
}
"""
```

**JSON Equivalent**

```json
{
  "source": "payment-processor",
  "payload": "{\n  \"status\": \"fail\",\n  \"reason\": \"Invalid card details\",\n  \"code\": 401\n}"
}
```

<br>

## 10. Multiline Text Containing HTML/XML

The multiline block can hold HTML or XML structure.

**EMON**

```emon
#(name:string, content:string)
=email-welcome, """
<p>
  Welcome, {{user.name}}!
</p>
<button class="primary">
  Activate
</button>
"""
```

**JSON Equivalent**

```json
{
  "name": "email-welcome",
  "content": "<p>\n  Welcome, {{user.name}}!\n</p>\n<button class=\"primary\">\n  Activate\n</button>\n"
}
```

<br>

## 11. Array of Type References

Demonstrates an array field that holds multiple references to a separately defined object type.

**EMON**

```emon
#skill(name:string, level:number)
#(name:string, skills:#skill[])
=David,[{Python,5},{MongoDB,3},{teamwork,4}]
```

**JSON Equivalent**

```json
{
  "name": "David",
  "skills": [
    { "name": "Python", "level": 5 },
    { "name": "MongoDB", "level": 3 },
    { "name": "teamwork", "level": 4 }
  ]
}
```

<br>

## 12. Multiple Schemas in One File

Demonstrates how data records follow the most recently defined schema.

**EMON**

```emon
// Schema 1: #ship
#(id:number, name:string)
=1,"Voyager"
=2,"Enterprise"

// Schema 2: #captain
#(shipId:number, name:string)
=1,"J. Sisko"
=2,"J. Picard"
```

**JSON Equivalent** (Output depends on which record set is being processed, but generally one root object/array)

If parsed as an array of #ship objects:

```json
[
  { "id": 1, "name": "Voyager" },
  { "id": 2, "name": "Enterprise" }
]
// ... and then an array of #captain objects:
[
  { "shipId": 1, "name": "J. Sisko" },
  { "shipId": 2, "name": "J. Picard" }
]
```

(The toJSON function should ideally return the last processed set, or handle the entire block for complex parsers.)

<br>

## 13. Inventory Log (Numbers and Booleans)

Simple demonstration of mixed numeric and boolean types.

**EMON**

```emon
#(name:string, inStock:bool, weightKg:number, lastChecked:number)[]
// weightKg is a float, lastChecked is a timestamp (integer)
=Widget-A,true,0.12,1678886400
=Gadget-B,false,1.5,1678972800
```

**JSON Equivalent**

```json
[
  {
    "name": "Widget-A",
    "inStock": true,
    "weightKg": 0.12,
    "lastChecked": 1678886400
  },
  {
    "name": "Gadget-B",
    "inStock": false,
    "weightKg": 1.5,
    "lastChecked": 1678972800
  }
]
```

<br>

## 14. Nested Multiline Text

A multiline string used as a value inside a nested object.

**EMON**

```emon
#(id:number, summary:[(notes:string, version:string)])
=10, [{
"""
Release notes for 2.1:
- Fixed critical bug in auth flow.
- Improved performance by 30%.
""", 2.1}]
```

**JSON Equivalent**

```json
{
  "id": 10,
  "summary": [
    {
      "notes": "Release notes for 2.1:\n- Fixed critical bug in auth flow.\n- Improved performance by 30%.\n",
      "version": "2.1"
    }
  ]
}
```

<br>

## 15. User Permissions Structure

Demonstrates an array of primitives (roles) and an array of simple nested objects (access) within one structure.

**EMON**

```emon
#access_rule(resource:string, permission:string)
#(username:string, roles:[string], access:#access_rule[])
=SystemAdmin,[admin,billing,user-mgmt],[{database,read},{settings,write}]
```

**JSON Equivalent**

```json
{
  "username": "SystemAdmin",
  "roles": ["admin", "billing", "user-mgmt"],
  "access": [
    { "resource": "database", "permission": "read" },
    { "resource": "settings", "permission": "write" }
  ]
}
```

<br>

## 16. Object with All Nulls

Demonstrates a record where all fields are explicitly set to null.

**EMON**

```emon
#(key:string, value:string, count:number, details:[(a:string)])
=test-nulls,null,null,null
```

**JSON Equivalent**

```json
{
  "key": "test-nulls",
  "value": null,
  "count": null,
  "details": null
}
```

<br>

## 17. Array of Objects with Only One Field (Inline)

Demonstrates a minimal inline object type [(a:string)].

**EMON**

```emon
#(id:number, names:[(first:string)])
=55,[{Alice},{Bob},{Charlie}]
```

**JSON Equivalent**

```json
{
  "id": 55,
  "names": [
    { "first": "Alice" },
    { "first": "Bob" },
    { "first": "Charlie" }
  ]
}
```

<br>

## 18. Complex Geographic Data (Nested Reference Array)

**EMON**

```emon
#coordinate(lat:number, lon:number)
#(name:string, boundary:#coordinate[])
=Ocean-Zone-A, [{40.71,-74.01}, {41.50,-73.00}, {40.00,-75.00}]
```

**JSON Equivalent**

```json
{
  "name": "Ocean-Zone-A",
  "boundary": [
    { "lat": 40.71, "lon": -74.01 },
    { "lat": 41.50, "lon": -73.00 },
    { "lat": 40.00, "lon": -75.00 }
  ]
}
```

<br>

## 19. Simple Array of Primitive Arrays

An array field containing an array of primitive types (like a matrix row).

**EMON**

```emon
#(id:string, rows:[[number]])
=matrix-4x2, [[1,2,3,4],[5,6,7,8]]
```

**JSON Equivalent**

```json
{
  "id": "matrix-4x2",
  "rows": [
    [1, 2, 3, 4],
    [5, 6, 7, 8]
  ]
}
```

<br>

## 20. Simple Array of Booleans

**EMON**

```emon
#(id:number, states:[bool])
=99,[true,false,false,true]
```

**JSON Equivalent**

```json
{
  "id": 99,
  "states": [true, false, false, true]
}
```

<br>

## 21. Data with Different Root Schema (Array)

**EMON**

```emon
#(code:string, description:string, severity:number)[]
=E100,"Disk Full",3
=W201,"Low Memory",1
=I300,"Backup Complete",0
```

**JSON Equivalent**

```json
[
  { "code": "E100", "description": "Disk Full", "severity": 3 },
  { "code": "W201", "description": "Low Memory", "severity": 1 },
  { "code": "I300", "description": "Backup Complete", "severity": 0 }
]
```

<br>

## Summary and Usage

These examples serve as the primary **reference and validation set** for EMON parser and converter implementations across various languages (JS, Python, PHP).

#### Key Takeaways for Developers:

1. **Efficiency**: Notice how little syntax is required for complex nested data (e.g., Example 7) compared to the verbose JSON equivalent.
2. **Strict Rules**: Consistent application of quoting (or lack thereof) and positional ordering is mandatory for successful parsing.
3. **Readability**: The use of comments (`//`) and multiline strings (`"""`) is designed to enhance the human-readability of the resulting data format without adding significant overhead.

By adhering to the structured schema and positional data format shown here, we ensure maximum data density and minimal file size, which is the core goal of the EMON project.
