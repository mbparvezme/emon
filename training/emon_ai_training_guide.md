# 🧠 AI Training Guide for EMON (Efficient Modular Object Notation)

This document defines how to train an AI model to understand, interpret, and convert between **EMON** and **JSON** formats. It includes concepts, dataset structure, and real examples for training and evaluation.

<br>

## 1. 🎯 Training Objective

The goal of this training is to make an AI model capable of:

1. **Understanding EMON syntax**

   * Detect schema definitions (`#object(...)`)
   * Parse data rows (`=value,...`)
   * Recognize nested structures and references

2. **Bidirectional Conversion**

   * EMON → JSON (structured data)
   * JSON → EMON (reconstruct schema and data)

3. **Context Awareness**

   * Understand how EMON can represent complex data (e.g., AI prompts, configurations, embeddings)

<br>

## 2. 📘 Concept Recap

**EMON (Efficient Modular Object Notation)**
is a compact and modular notation for structured data, designed for:

* Low-token AI data representation
* Human-readable schemas
* Fast conversion with minimal redundancy

Example:

```
#user(name:string, age:number, verified:bool)
=Parvez, 30, true
=Rafi, 27, false
```

Equivalent JSON:

```json
[
  { "name": "Parvez", "age": 30, "verified": true },
  { "name": "Rafi", "age": 27, "verified": false }
]
```

<br>

## 3. 📁 Dataset Structure

Each training example pair should be stored in **JSONL** format.

### **File:** `emon_ai_training_data.jsonl`

Each line contains one training sample:

```json
{
  "input_type": "EMON",
  "output_type": "JSON",
  "input": "<EMON data>",
  "output": "<Equivalent JSON>"
}
```

and vice versa for JSON → EMON.

<br>

## 4. 🧩 Example Dataset (Simplified View)

### 4.1 Simple Object

**EMON → JSON**

```json
{
  "input_type": "EMON",
  "output_type": "JSON",
  "input": "#user(name:string, age:number, verified:bool)\n=Parvez,30,true",
  "output": [{"name": "Parvez", "age": 30, "verified": true}]
}
```

**JSON → EMON**

```json
{
  "input_type": "JSON",
  "output_type": "EMON",
  "input": [{"name": "Parvez", "age": 30, "verified": true}],
  "output": "#user(name:string, age:number, verified:bool)\n=Parvez,30,true"
}
```

<br>

### 4.2 Nested Object Reference

**EMON → JSON**

```json
{
  "input_type": "EMON",
  "output_type": "JSON",
  "input": "#user(name:string, profile:#profile)\n#profile(bio:string, location:string)\n=Rafi,{\"bio\":\"Engineer\",\"location\":\"Dhaka, BD\"}",
  "output": [{"name": "Rafi", "profile": {"bio": "Engineer", "location": "Dhaka, BD"}}]
}
```

**JSON → EMON**

```json
{
  "input_type": "JSON",
  "output_type": "EMON",
  "input": [{"name":"Rafi","profile":{"bio":"Engineer","location":"Dhaka, BD"}}],
  "output": "#user(name:string, profile:#profile)\n#profile(bio:string, location:string)\n=Rafi,{\"bio\":\"Engineer\",\"location\":\"Dhaka, BD\"}"
}
```

<br>

### 4.3 AI Prompt Example

**EMON → JSON**

```json
{
  "input_type": "EMON",
  "output_type": "JSON",
  "input": "#prompt(id:number, title:string, input:string, output:string)\n=1,\"Summarize this text\",\"Artificial Intelligence is the future\",\"AI shapes the future of tech\"",
  "output": [{"id":1,"title":"Summarize this text","input":"Artificial Intelligence is the future","output":"AI shapes the future of tech"}]
}
```

**JSON → EMON**

```json
{
  "input_type": "JSON",
  "output_type": "EMON",
  "input": [{"id":1,"title":"Summarize this text","input":"Artificial Intelligence is the future","output":"AI shapes the future of tech"}],
  "output": "#prompt(id:number, title:string, input:string, output:string)\n=1,\"Summarize this text\",\"Artificial Intelligence is the future\",\"AI shapes the future of tech\""
}
```

<br>

### 4.4 Multi-level Nested Structures

**EMON → JSON**

```json
{
  "input_type": "EMON",
  "output_type": "JSON",
  "input": "#project(title:string, meta:#meta)\n#meta(dataset:#dataset, settings:#settings)\n#dataset(name:string, size:number)\n#settings(batch:int, optimizer:string)\n=\"AI Trainer\",{\"dataset\":{\"name\":\"emon_ai\",\"size\":5120},\"settings\":{\"batch\":16,\"optimizer\":\"adam\"}}",
  "output": [{"title":"AI Trainer","meta":{"dataset":{"name":"emon_ai","size":5120},"settings":{"batch":16,"optimizer":"adam"}}}]
}
```

<br>

### 4.5 Model Config Example

**EMON → JSON**

```json
{
  "input_type": "EMON",
  "output_type": "JSON",
  "input": "#config(model:string,temp:number,embeddings:[number])\n=\"gpt-5\",0.7,[0.12,0.98,0.34]",
  "output": [{"model":"gpt-5","temp":0.7,"embeddings":[0.12,0.98,0.34]}]
}
```

<br>

## 5. Data Composition Rules

1. **Balanced Direction:**

   * 500 samples EMON→JSON
   * 500 samples JSON→EMON

2. **Complexity Levels:**

   * 300 simple structures
   * 400 nested/referenced structures
   * 300 deeply nested with arrays/mixed objects

3. **Diversity:**

   * AI data (prompts, configs, embeddings)
   * Human data (users, profiles, todos)
   * Structural-only (to train syntax parsing)

4. **Field Type Coverage:**

   * string, number, bool, int, float, [string], [number], references

<br>

## 6. 🧠 Training Focus Areas

| Area                 | Description                                 | Example                          |
| -------------------- | ------------------------------------------- | -------------------------------- |
| Schema recognition   | Detect and match schema definition patterns | `#object(field:type,field:type)` |
| Type mapping         | Learn field → value consistency             | `age:number` → `30`              |
| Nested understanding | Identify recursive object references        | `profile:#profile`               |
| Compact formatting   | Handle commas, arrays, and minimal spacing  | `=1,"text",true,[...]`           |
| Reconstruction       | Generate valid EMON syntax from JSON        | JSON → EMON                      |

<br>

## 7. 💡 Potential Use Cases

| Area                       | Description                                         |
| -------------------------- | --------------------------------------------------- |
| **AI Model Optimization**  | Use EMON instead of JSON for compact prompt tokens. |
| **Data Interchange**       | Faster schema transfer across LLM-based tools.      |
| **Embedding Storage**      | Compact vector data representation.                 |
| **Prompt Archives**        | Store large AI training samples efficiently.        |
| **IDE/Browser Extensions** | Enable real-time EMON validation or visualization.  |

<br>

## 8. 📊 File Summary

| File                          | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `emon_ai_training_data.jsonl` | 1,000 EMON↔JSON pairs for training |
| `schema/1.0/index.json`       | JSON definition of EMON syntax     |
| `schema/1.0/index.ebnf`       | Grammar for EMON parsing           |
| `schema/1.0/index.emon`       | EMON version of schema definition  |

<br>

## 9. 🧩 Key Insight

AI should learn that:

* **EMON is not a replacement** for JSON — it’s an **optimized representation**.
* **Conversion is reversible and deterministic.**
* **Nested EMON** uses `#references` for reusability, making it efficient for AI processing.

<br>

## 10. Best Practices

1. Keep type definitions consistent.
2. Use nested objects instead of mixed-type arrays.
3. Maintain readability for humans while being machine-parsable.
4. Validate examples against schema definitions.
5. Balance dataset complexity (simple ↔ nested ↔ AI prompts).

<br>

## 11. ✅ Summary

* The dataset should mix structural, natural, and AI-oriented EMON data.
* Keep each example pair independent and clear.
* Maintain balance between schema diversity and consistency.
* Ensure strict validation against your schema/1.0 definitions.

Once trained, your AI model will:

* Accept EMON as native structured input.
* Convert large JSON datasets to EMON for efficient prompt token usage.
* Serve as the base for EMON ecosystem tools (e.g., IDE parser, browser converter, or LLM assistant).
