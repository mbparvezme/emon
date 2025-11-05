# AI Efficiency

This document explains why using our structured format improves efficiency for AI models and pipelines.

---

<br>

## Advantages

1. **Explicit Types**

   * Fields are clearly typed (`string`, `number`, `bool`) → no AI inference needed.
   * Example:

     ```emon
     #task(id:number, title:string, completed:bool)
     =101, "Write report", false
     ```

2. **Clear Nesting**

   * Nested structures are defined by type declarations.
   * AI can directly map input to structured objects without guessing.

3. **Predictable Structure**

   * Every file follows a consistent pattern.
   * Facilitates faster feature extraction and model training.

4. **Compact Representation**

   * Less verbose than JSON → fewer tokens processed.
   * Reduces computational cost and speeds up processing.

<br>

## Detailed Example

**Input**

```emon
#employee(id:number, name:string, skills:[#skill])
#skill(name:string, level:string)
=1,Parvez,[{PHP,Expert},{JS,Intermediate}]
```

**Benefits**

* AI immediately knows types: `id`=number, `name`=string, `skills`=array of `skill` objects.
* Nested objects are clearly separated → fewer parsing errors.
* Array lengths and types are predictable.

<br>

## Use Cases

* Preparing datasets for NLP models.
* Structuring configuration data for automated systems.
* Exchanging data between AI microservices.
* Any scenario requiring deterministic AI input parsing.

<br>

## Best Practices

* Keep type definitions consistent across files.
* Use nested objects instead of unstructured arrays of mixed types.
* Ensure arrays are homogenous in type.