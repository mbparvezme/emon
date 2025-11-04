// syntax.md

# Syntax Guide

This document provides a comprehensive guide to the syntax used in our structured data format. Understanding this will help you write clean, consistent, and AI-friendly data files.

---

## Basic Structure

* **Type Declaration**: Begin with a `#` to define the type and its fields.

  ```
  #type_name(field:type, ...)
  ```

  Example:

  ```
  #user(id:number, name:string, roles:[string])
  ```

* **Value Assignment**: Use `=` to assign values to the defined type.

  ```
  =1, "Alice", ["admin","editor"]
  ```

* **Nested Structures**: Nested objects or arrays are explicitly defined.

  ```
  #project(name:string, members:[#member])
  #member(name:string, role:string)
  ="TeamX", [{"Alice","Lead"},{"Bob","Engineer"}]
  ```

---

## Field Types

* `string`: Text values enclosed in quotes
* `number`: Numeric values (integers or floats)
* `bool`: Boolean values `true` or `false`
* `[type]`: Array of values of a specific type
* `#type`: Nested type reference

---

## Rules & Best Practices

1. **Always define types first** before using them in nested objects.
2. **Consistent Field Order**: Keep the same order of fields for clarity.
3. **No Circular References**: Avoid types that refer to each other in a loop.
4. **Arrays & Objects**: Arrays can contain either primitive types or nested objects.
5. **Comments**: Inline comments are not allowed inside values.

---

### Example

```
#employee(id:number, name:string, skills:[#skill])
#skill(name:string, level:string)
=1, "Parvez", [{"PHP","Expert"},{"JS","Intermediate"}]
```

* `id` is a number, `name` is a string.
* `skills` is an array of nested objects of type `skill`.
* Easy for AI to parse without ambiguity.

---

## Notes

* Maintain readability for humans while being AI-parsable.
* Ideal for training datasets, configurations, or structured AI input.

---