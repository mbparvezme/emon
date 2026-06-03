# EMON Examples

This document provides practical examples for every syntax rule in EMON. Each example includes the EMON file and its JSON equivalent. Examples are organized to match the rule order in the Syntax Guide.

---

## 1. File Structure

A complete EMON file following the required top-to-bottom order: directives, imports, named types, root schema, data records.

```emon
@version(1.0)
@encoding(utf-8)

import "./types/address.emon"

#skill(name:string,level:string)

#(id:number,name:string,location:#address,skills:#skill[])[]

=1,Alice,{London,UK},[{PHP,Expert},{JS,Intermediate}]
=2,Bob,{Paris,France},[{Python,Advanced}]
```

```json
[
  {
    "id": 1,
    "name": "Alice",
    "location": { "city": "London", "country": "UK" },
    "skills": [
      { "name": "PHP", "level": "Expert" },
      { "name": "JS", "level": "Intermediate" }
    ]
  },
  {
    "id": 2,
    "name": "Bob",
    "location": { "city": "Paris", "country": "France" },
    "skills": [
      { "name": "Python", "level": "Advanced" }
    ]
  }
]
```

---

## 2. Directives

### 2.1 — Version only

```emon
@version(1.0)

#(id:number,name:string)[]

=1,Alice
=2,Bob
```

### 2.2 — Multiple directives

```emon
@version(1.0)
@encoding(utf-8)
@lang(en)

#(id:number,title:string,published:bool)[]

=101,"Getting Started with EMON",true
=102,"Advanced Schema Design",false
```

```json
[
  { "id": 101, "title": "Getting Started with EMON", "published": true },
  { "id": 102, "title": "Advanced Schema Design", "published": false }
]
```

---

## 3. Imports

Named types from `./types/geo.emon` are used directly after import. Root schemas and data records from the imported file are ignored.

```emon
@version(1.0)

import "./types/geo.emon"
import "https://schemas.example.com/common/tag.emon"

#(id:number,name:string,location:#coordinate,tags:#tag[])[]

=1,Station-A,{40.71,-74.01},[{urgent},{monitored}]
=2,Station-B,{41.50,-73.00},[{routine}]
```

```json
[
  {
    "id": 1,
    "name": "Station-A",
    "location": { "lat": 40.71, "lon": -74.01 },
    "tags": [{ "label": "urgent" }, { "label": "monitored" }]
  },
  {
    "id": 2,
    "name": "Station-B",
    "location": { "lat": 41.50, "lon": -73.00 },
    "tags": [{ "label": "routine" }]
  }
]
```

---

## 4. Named Type Definitions

### 4.1 — Single named type

```emon
#address(street:string,city:string,country:string)

#(id:number,name:string,address:#address)[]

=1,Alice,{"123 Main St",London,UK}
=2,Bob,{"456 Oak Ave",Paris,France}
```

```json
[
  {
    "id": 1,
    "name": "Alice",
    "address": { "street": "123 Main St", "city": "London", "country": "UK" }
  },
  {
    "id": 2,
    "name": "Bob",
    "address": { "street": "456 Oak Ave", "city": "Paris", "country": "France" }
  }
]
```

### 4.2 — Multiple named types

```emon
#tag(label:string,color:string)
#author(name:string,email:string)

#(id:number,title:string,author:#author,tags:#tag[])[]

=1,"Getting Started",{Alice,"alice@example.com"},[{tutorial,blue},{beginner,green}]
=2,"Advanced Patterns",{Bob,"bob@example.com"},[{advanced,red}]
```

```json
[
  {
    "id": 1,
    "title": "Getting Started",
    "author": { "name": "Alice", "email": "alice@example.com" },
    "tags": [
      { "label": "tutorial", "color": "blue" },
      { "label": "beginner", "color": "green" }
    ]
  },
  {
    "id": 2,
    "title": "Advanced Patterns",
    "author": { "name": "Bob", "email": "bob@example.com" },
    "tags": [{ "label": "advanced", "color": "red" }]
  }
]
```

---

## 5. Root Schema

### 5.1 — Single object (no `[]`)

```emon
#(appName:string,version:string,debug:bool)

=MyApp,2.1.0,false
```

```json
{
  "appName": "MyApp",
  "version": "2.1.0",
  "debug": false
}
```

### 5.2 — Array of objects (with `[]`)

```emon
#(id:number,name:string,active:bool)[]

=1,Alice,true
=2,Bob,false
=3,Carol,true
```

```json
[
  { "id": 1, "name": "Alice", "active": true },
  { "id": 2, "name": "Bob", "active": false },
  { "id": 3, "name": "Carol", "active": true }
]
```

---

## 6. Data Records

### 6.1 — Basic positional values

```emon
#(id:number,username:string,email:string,verified:bool)[]

=1001,JaneDoe,"jane@corp.com",true
=1002,md_asad,"asad@corp.com",false
```

```json
[
  { "id": 1001, "username": "JaneDoe", "email": "jane@corp.com", "verified": true },
  { "id": 1002, "username": "md_asad", "email": "asad@corp.com", "verified": false }
]
```

---

## 7. Field Types

### 7.1 — All primitive types

```emon
#(name:string,age:number,score:number,active:bool)[]

=Alice,30,98.5,true
=Bob,25,74.0,false
```

```json
[
  { "name": "Alice", "age": 30, "score": 98.5, "active": true },
  { "name": "Bob", "age": 25, "score": 74.0, "active": false }
]
```

### 7.2 — String array

```emon
#(username:string,roles:string[])[]

=alice,[admin,editor,viewer]
=bob,[viewer]
```

```json
[
  { "username": "alice", "roles": ["admin", "editor", "viewer"] },
  { "username": "bob", "roles": ["viewer"] }
]
```

### 7.3 — Number array

```emon
#(label:string,scores:number[])[]

=TeamA,[88,92,76,95]
=TeamB,[70,65,80]
```

```json
[
  { "label": "TeamA", "scores": [88, 92, 76, 95] },
  { "label": "TeamB", "scores": [70, 65, 80] }
]
```

### 7.4 — Boolean array

```emon
#(device:string,states:bool[])[]

=SensorBank1,[true,false,true,true]
=SensorBank2,[false,false,true]
```

```json
[
  { "device": "SensorBank1", "states": [true, false, true, true] },
  { "device": "SensorBank2", "states": [false, false, true] }
]
```

### 7.5 — Named type reference (`#type`)

```emon
#location(city:string,country:string)

#(id:number,name:string,location:#location)[]

=1,Alice,{London,UK}
=2,Bob,{Dhaka,Bangladesh}
```

```json
[
  { "id": 1, "name": "Alice", "location": { "city": "London", "country": "UK" } },
  { "id": 2, "name": "Bob", "location": { "city": "Dhaka", "country": "Bangladesh" } }
]
```

### 7.6 — Array of named type (`#type[]`)

```emon
#skill(name:string,level:string)

#(name:string,skills:#skill[])[]

=Alice,[{PHP,Expert},{JS,Intermediate}]
=Bob,[{Python,Advanced},{SQL,Beginner}]
```

```json
[
  {
    "name": "Alice",
    "skills": [
      { "name": "PHP", "level": "Expert" },
      { "name": "JS", "level": "Intermediate" }
    ]
  },
  {
    "name": "Bob",
    "skills": [
      { "name": "Python", "level": "Advanced" },
      { "name": "SQL", "level": "Beginner" }
    ]
  }
]
```

---

## 8. Optional Fields (`?`)

### 8.1 — Trailing optional fields omitted

When optional fields are at the end, they can be left out entirely. The parser assigns `null` automatically.

```emon
#(id:number,name:string,bio?:string,website?:string)[]

=1,Alice
=2,Bob,"A backend developer"
=3,Carol,"UI designer","carol.dev"
```

```json
[
  { "id": 1, "name": "Alice", "bio": null, "website": null },
  { "id": 2, "name": "Bob", "bio": "A backend developer", "website": null },
  { "id": 3, "name": "Carol", "bio": "UI designer", "website": "carol.dev" }
]
```

### 8.2 — Multiple optional fields, partially provided

```emon
#(id:number,name:string,phone?:string,city?:string,country?:string)[]

=1,Alice,"+880-1700-000000"
=2,Bob,null,Dhaka,Bangladesh
=3,Carol
```

```json
[
  { "id": 1, "name": "Alice", "phone": "+880-1700-000000", "city": null, "country": null },
  { "id": 2, "name": "Bob", "phone": null, "city": "Dhaka", "country": "Bangladesh" },
  { "id": 3, "name": "Carol", "phone": null, "city": null, "country": null }
]
```

---

## 9. Quotation Rules

```emon
#(full_name:string,username:string,email:string,city:string)[]

// ✅ Correct quotation
="M. Hasan",md_hasan,"hasan@example.com","New York, USA"

// ❌ full_name must be quoted — contains a dot and space
// =M. Hasan,md_hasan,"hasan@example.com","New York, USA"

// ❌ username must not be quoted — contains only letters, digits, underscore
// ="M. Hasan","md_hasan","hasan@example.com","New York, USA"
```

```json
[
  {
    "full_name": "M. Hasan",
    "username": "md_hasan",
    "email": "hasan@example.com",
    "city": "New York, USA"
  }
]
```

---

## 10. Null Values

### 10.1 — Explicit null in a non-terminal field

```emon
#(id:number,name:string,middle_name:string,surname:string)[]

=1,Alice,null,Smith
=2,Bob,null,Jones
```

```json
[
  { "id": 1, "name": "Alice", "middle_name": null, "surname": "Smith" },
  { "id": 2, "name": "Bob", "middle_name": null, "surname": "Jones" }
]
```

### 10.2 — Null vs quoted `"null"`

```emon
#(id:number,status:string,note:string)[]

=1,null,"No status set"
=2,active,"null"
```

```json
[
  { "id": 1, "status": null, "note": "No status set" },
  { "id": 2, "status": "active", "note": "null" }
]
```

### 10.3 — Empty array vs null

```emon
#(id:number,name:string,tags:string[],notes:string)[]

=1,Alice,[],""
=2,Bob,null,null
```

```json
[
  { "id": 1, "name": "Alice", "tags": [], "notes": "" },
  { "id": 2, "name": "Bob", "tags": null, "notes": null }
]
```

---

## 11. Numbers

### 11.1 — Integers, floats, signed values

```emon
#(label:string,integer:number,float:number,positive:number,negative:number)[]

=Row1,42,3.14,+10,-7
=Row2,0,-0.5,+100,-3.14
```

```json
[
  { "label": "Row1", "integer": 42, "float": 3.14, "positive": 10, "negative": -7 },
  { "label": "Row2", "integer": 0, "float": -0.5, "positive": 100, "negative": -3.14 }
]
```

---

## 12. Inline Type Definitions

### 12.1 — Simple inline type

```emon
#(id:string,items:[(name:string,qty:number,price:number)])[]

=ORD-001,[{Mug,2,12.50},{Pen,5,1.99}]
=ORD-002,[{Notebook,1,8.00}]
```

```json
[
  {
    "id": "ORD-001",
    "items": [
      { "name": "Mug", "qty": 2, "price": 12.50 },
      { "name": "Pen", "qty": 5, "price": 1.99 }
    ]
  },
  {
    "id": "ORD-002",
    "items": [
      { "name": "Notebook", "qty": 1, "price": 8.00 }
    ]
  }
]
```

### 12.2 — Inline type used as a single nested object

```emon
#(name:string,config:(host:string,port:number,secure:bool))[]

=ServiceA,{api.example.com,443,true}
=ServiceB,{internal.local,8080,false}
```

```json
[
  { "name": "ServiceA", "config": { "host": "api.example.com", "port": 443, "secure": true } },
  { "name": "ServiceB", "config": { "host": "internal.local", "port": 8080, "secure": false } }
]
```

### 12.3 — Deeply nested inline type

```emon
#(name:string,settings:[(timeout:number,retry:[(max:number,delay:number)])])[]

=API-Client-1,[{15000,[{3,500},{5,1000}]}]
```

```json
[
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
]
```

---

## 13. Arrays

### 13.1 — Primitive arrays

```emon
#(id:number,tags:string[],scores:number[],flags:bool[])[]

=1,[alpha,beta,gamma],[10,20,30],[true,false,true]
```

```json
[
  {
    "id": 1,
    "tags": ["alpha", "beta", "gamma"],
    "scores": [10, 20, 30],
    "flags": [true, false, true]
  }
]
```

### 13.2 — Empty array

```emon
#(id:number,name:string,roles:string[])[]

=1,Alice,[admin,editor]
=2,Bob,[]
```

```json
[
  { "id": 1, "name": "Alice", "roles": ["admin", "editor"] },
  { "id": 2, "name": "Bob", "roles": [] }
]
```

### 13.3 — Array of arrays (matrix)

```emon
#(id:string,matrix:[[number]])[]

=grid-A,[[1,2,3],[4,5,6],[7,8,9]]
```

```json
[
  {
    "id": "grid-A",
    "matrix": [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
  }
]
```

---

## 14. Tuples

### 14.1 — Single tuple field

```emon
#coordinate(lat:number,lon:number)

#(name:string,position:#coordinate)[]

=PointA,{40.71,-74.01}
=PointB,{51.50,-0.12}
```

```json
[
  { "name": "PointA", "position": { "lat": 40.71, "lon": -74.01 } },
  { "name": "PointB", "position": { "lat": 51.50, "lon": -0.12 } }
]
```

### 14.2 — Array of tuples

```emon
#member(name:string,role:string)

#(team:string,members:#member[])[]

=Engineering,[{Alice,Lead},{Bob,Developer},{Carol,QA}]
=Design,[{Dave,Designer},{Eve,Researcher}]
```

```json
[
  {
    "team": "Engineering",
    "members": [
      { "name": "Alice", "role": "Lead" },
      { "name": "Bob", "role": "Developer" },
      { "name": "Carol", "role": "QA" }
    ]
  },
  {
    "team": "Design",
    "members": [
      { "name": "Dave", "role": "Designer" },
      { "name": "Eve", "role": "Researcher" }
    ]
  }
]
```

---

## 15. Comments

### 15.1 — Single-line comments

```emon
// Product catalog
#(sku:string,name:string,price:number,inStock:bool)[]

// In-stock items
=SKU001,Apple,0.99,true
=SKU002,"Orange Juice",3.45,true

// Out-of-stock items
=SKU003,"Sparkling Water",1.20,false
```

```json
[
  { "sku": "SKU001", "name": "Apple", "price": 0.99, "inStock": true },
  { "sku": "SKU002", "name": "Orange Juice", "price": 3.45, "inStock": true },
  { "sku": "SKU003", "name": "Sparkling Water", "price": 1.20, "inStock": false }
]
```

### 15.2 — Multi-line comments

```emon
/*
  Employee records.
  Fields: id, name, department, salary
  Last updated: 2026-06-01
*/
#(id:number,name:string,department:string,salary:number)[]

=1,Alice,Engineering,95000
=2,Bob,Marketing,72000
```

```json
[
  { "id": 1, "name": "Alice", "department": "Engineering", "salary": 95000 },
  { "id": 2, "name": "Bob", "department": "Marketing", "salary": 72000 }
]
```

### 15.3 — Comments between sections

```emon
@version(1.0)

// Reusable address type
#address(city:string,country:string)

/*
  Root schema for customer records.
  address field uses the #address named type.
*/
#(id:number,name:string,address:#address)[]

=1,Alice,{London,UK}
=2,Bob,{Dhaka,Bangladesh}
```

```json
[
  { "id": 1, "name": "Alice", "address": { "city": "London", "country": "UK" } },
  { "id": 2, "name": "Bob", "address": { "city": "Dhaka", "country": "Bangladesh" } }
]
```

---

## 16. Escape Sequences

```emon
#(id:number,message:string,path:string,note:string)[]

=1,"He said \"Hello\" to me.","C:\\Users\\Alice\\docs","Line1\nLine2"
=2,"She replied \"Hi there!\"","C:\\Projects\\emon","Col1\tCol2"
```

```json
[
  {
    "id": 1,
    "message": "He said \"Hello\" to me.",
    "path": "C:\\Users\\Alice\\docs",
    "note": "Line1\nLine2"
  },
  {
    "id": 2,
    "message": "She replied \"Hi there!\"",
    "path": "C:\\Projects\\emon",
    "note": "Col1\tCol2"
  }
]
```

---

## 17. Multiline Strings

### 17.1 — Basic multiline string

```emon
#(title:string,body:string)[]

="Q3 Summary","""
The third quarter exceeded expectations.
Key highlights:
  - 15% growth in services.
  - Successful product launch.
"""
```

```json
[
  {
    "title": "Q3 Summary",
    "body": "The third quarter exceeded expectations.\nKey highlights:\n  - 15% growth in services.\n  - Successful product launch.\n"
  }
]
```

### 17.2 — Multiline string containing JSON

```emon
#(source:string,payload:string)[]

=payment-processor,"""
{
  "status": "fail",
  "reason": "Invalid card details",
  "code": 401
}
"""
```

```json
[
  {
    "source": "payment-processor",
    "payload": "{\n  \"status\": \"fail\",\n  \"reason\": \"Invalid card details\",\n  \"code\": 401\n}"
  }
]
```

### 17.3 — Multiline string containing HTML

```emon
#(name:string,content:string)[]

=email-welcome,"""
<p>Welcome, {{user.name}}!</p>
<button class="primary">Activate</button>
"""
```

```json
[
  {
    "name": "email-welcome",
    "content": "<p>Welcome, {{user.name}}!</p>\n<button class=\"primary\">Activate</button>\n"
  }
]
```

---

## 18. Type Validation

### 18.1 — Valid vs invalid values per type

```emon
// ✅ Valid
#(age:number,active:bool,name:string)
=25,true,Alice

// ❌ "25" is a string in a number field — type error
// =25,true,"Alice" is fine, but ="25",true,Alice is not for age:number

// ❌ "yes" is not a valid bool — only true or false
// =25,yes,Alice
```

---

## 19. Complete Real-World Example

An e-commerce order file using all major syntax features.

```emon
@version(1.0)
@encoding(utf-8)

#address(street:string,city:string,country:string)
#item(sku:string,name:string,qty:number,price:number)

#(orderId:string,customer:string,email?:string,address:#address,items:#item[],notes?:string)[]

=ORD-001,Alice,"alice@shop.com",{"123 Main St",London,UK},[{SKU-A,Widget,2,9.99},{SKU-B,Gadget,1,24.99}],"Please gift wrap."
=ORD-002,Bob,null,{"456 Oak Ave",Paris,France},[{SKU-C,Gizmo,3,4.50}]
=ORD-003,Carol
```

```json
[
  {
    "orderId": "ORD-001",
    "customer": "Alice",
    "email": "alice@shop.com",
    "address": { "street": "123 Main St", "city": "London", "country": "UK" },
    "items": [
      { "sku": "SKU-A", "name": "Widget", "qty": 2, "price": 9.99 },
      { "sku": "SKU-B", "name": "Gadget", "qty": 1, "price": 24.99 }
    ],
    "notes": "Please gift wrap."
  },
  {
    "orderId": "ORD-002",
    "customer": "Bob",
    "email": null,
    "address": { "street": "456 Oak Ave", "city": "Paris", "country": "France" },
    "items": [
      { "sku": "SKU-C", "name": "Gizmo", "qty": 3, "price": 4.50 }
    ],
    "notes": null
  },
  {
    "orderId": "ORD-003",
    "customer": "Carol",
    "email": null,
    "address": null,
    "items": null,
    "notes": null
  }
]
```
