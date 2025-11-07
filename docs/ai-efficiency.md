# AI Efficiency

This document explains how using EMON’s structured format increases efficiency for AI models and data pipelines.

<br>

## Advantages

1. **Explicit Types**

   * Each field is clearly typed (`string`, `number`, `bool`), so AI models don’t need to infer data types.
   * Example:

     ```emon
     #task(id:number, title:string, completed:bool)
     =101, "Write report", false
     ```

2. **Clear Nesting**

   * Nested objects are defined through reusable type declarations.
   * AI systems can directly map input to structured objects without guessing.

3. **Predictable Structure**

   * Every EMON file follows a consistent type-first format.
   * Makes feature extraction and model training faster and more accurate.

4. **Compact Representation**

   * Less verbose than JSON, saving up to 40–70% tokens.
   * Reduces computation cost and improves parsing speed.

<br>

## Detailed Example

**Input**

```emon
#employee(id:number, name:string, skills:[#skill])
#skill(name:string, level:string)

=1,Parvez,[{PHP,Expert},{JS,Intermediate}]
```

**AI Benefits**

* Recognizes types instantly - `id` as number, `name` as string, and `skills` as an array of `#skill` objects.
* Nested and array structures are clearly defined → fewer parsing or hallucination errors.
* Token usage and parsing time decrease significantly.

<br>

## Use Cases

* Preparing datasets for NLP models.
* Structuring configuration data for automated systems.
* Exchanging data between AI microservices.
* Any scenario requiring deterministic AI input parsing.

<br>

## Best Practices

* Keep type definitions consistent across files.
* Use nested objects instead of unstructured mixed arrays.
* Ensure arrays contain uniform data types.
* Prefer short, descriptive type names for clarity.