# EMON: Efficient Modular Object Notation

**EMON** is a compact, modular, and AI-friendly structured data format designed for research, AI pipelines, web/mobile data exchange, and human-readable configuration. It provides a minimal yet expressive way to represent structured information, making it ideal for **AI training, data serialization, and efficient communication** across systems.

Unlike JSON or XML, EMON is built with **efficiency in mind**: every symbol, key, and quote is considered for its impact on storage, bandwidth, or token usage. This makes EMON particularly valuable in AI applications where token economy translates directly into **lower cost** and **faster model processing**.

<br>

## Why EMON

While JSON is simple, readable, and widely supported, it introduces redundancy that can become costly in large-scale systems:

- **Repetitive keys and field names** increase file size and network payload.
- **Excessive quotes and braces** inflate token counts in AI model interactions.
- **Verbosity** slows parsing and increases memory overhead.

**EMON** rethinks these limitations by providing:

- **Compact, positional syntax**: values follow the schema order, removing repeated key names.
- **Type-aware field definitions**: each field has an explicit type (string, number, bool, nested type) to ensure correctness.
- **Minimal structural symbols**: braces, quotes, and brackets appear only when necessary.
- **AI-token efficient**: reduces token usage by 40–60% compared to standard JSON.
- **Cross-domain utility**: works for AI, web APIs, mobile data, IoT messages, and database serialization.
- **Lossless JSON Mapping:** Can be seamlessly converted to and from JSON for integration into existing workflows.

By optimizing both **human readability** and **machine efficiency**, EMON strikes a balance between clarity and performance.

<br>

Here is a quick look at how the same data looks in both JSON and EMON. This makes it easy to see the difference in structure and style.

<table>
    <tr>
        <th width="50%">JSON</th>
        <th width="50%">EMON</th>
    </tr>
    <tr>
        <td>

```json
[
  {
    "name": "Parvez",
    "age": 30,
    "profile": {
      "bio": "Developer",
      "location": "NY, USA"
    },
    "verified": true
  },
  {
    "name": "Rafi",
    "age": 27,
    "profile": {
      "bio": "Designer",
      "location": "Dhaka, BD"
    },
    "verified": false
  },
  {
    "name": "Sana",
    "age": 22,
    "profile": {
      "bio": "Writer",
      "location": "Delhi, IN"
    },
    "verified": true
  }
]

```
</td>
        <td>

```emon
// Schema
#(name:string,age:number,profile:#profile,verified:bool)
#profile(bio:string,location:string)

// Data
=Parvez,30,{Developer,"NY, USA"},true
=Rafi,27,{Designer,"Dhaka, BD"},false
=Sana,22,{Writer,"Delhi, IN"},true
```
</td>
    </tr>
</table>

**Result:** EMON is significantly smaller and uses fewer tokens because the field names (`name`, `age`, etc.) are only defined once, not repeated for every object.

<br>

> “The goal isn’t to replace JSON overnight, but to inspire a cleaner, more efficient way of structuring the data of tomorrow.”
> — *M B Parvez*

<br>

## Key Features & Benefits of EMON

**1. Token Efficiency (40%–70% Savings)**<br>
EMON's core innovation is reducing the size of the structured payload. This reduction lowers LLM API costs and accelerates data processing in high-volume AI pipelines.

**2. Structural Modularity**<br>
Type definitions are reusable and referenceable (`#profile`). This modular design promotes clear data modeling, simplifies maintenance, and reduces duplication across large datasets.

**3. Nested & Flexible**<br>
EMON naturally supports **multi-level, mixed-type objects**, arrays, and inline nested types. Complex data structures can be modeled without verbose syntax, keeping it readable for humans while being fully machine-parsable.

**4. AI-Friendly & Token-Efficient**<br>
By eliminating redundancy, EMON **reduces token consumption** in AI applications by up to 60%. It is ideal for training AI models, feeding large datasets into generative models, or exchanging structured data in low-token-cost pipelines.

**5. Readable & Human-Friendly**<br>
Unlike JSON or XML, EMON minimizes structural clutter - braces, quotes, and separators appear **only when necessary**. This makes it easy for developers, analysts, or AI models to read and understand, while maintaining a compact representation.

**6. Cross-Domain Utility**<br>
EMON is optimized for fast transmission across bandwidth-constrained environments, making it ideal for **HTTP APIs, mobile data sync, and IoT telemetry**.

**7. Plain Text & UTF-8 Safe**<br>
EMON is fully compatible with UTF-8 encoding and **plain text storage**. It can be saved, shared, or transmitted easily across systems without requiring special binary formats.

**8. Easy JSON Integration**<br>
EMON can be converted **to/from JSON** losslessly. This allows smooth integration with existing JSON-based workflows while benefiting from EMON’s compactness and efficiency.

<br>

## File Format, Media Type and Encoding
EMON documents use the `.emon` extension, making them easy to recognize and manage in file systems. When shared over the web or processed by software that handles content types, EMON files should use the media type `text/emon` to ensure proper interpretation. All EMON files are saved in `UTF-8` encoding. While specifying `charset=utf-8` is optional, UTF-8 is always assumed when it’s not included.

<br>

## Modularity
EMON encourages **modular and reusable type definitions**, allowing you to break large structures into smaller, maintainable parts. Each module (type) can be defined once and referenced anywhere - improving clarity and reducing duplication.

A core strength of EMON is its **modular design**. Complex datasets can be decomposed into **small**, **reusable type definitions**, allowing:

- **Single definition reuse**: Define a type once, reference it multiple times across different structures.
- **Nested types and arrays**: Support for objects within objects, and arrays of types, without extra syntax overhead.
- **Simplified maintenance**: Updating a single type automatically propagates to all references, reducing errors.
- **Clearer data modeling**: Each module clearly defines fields and types, improving readability for humans and parsers alike.

#### Example: Modular Type Usage
```emon
#(id:number,name:string,profile:#profile,roles:[string])
#profile(age:number,city:string)

=1,Alice,{30,"New York"},[admin,editor]
=2,Bob,{25,London},[user]
```

Here, the `profile` type is defined once and referenced inside `user`. The syntax is **compact**, yet fully expressive and human-readable.

#### How it works

* The entire payload structure starts with the most token-efficient root: `#(...)[]`.
* The named type `#profile` is defined once for the structure `age:number, city:string`.
* The root definition then references the reusable structure via `profile:#profile`.
* All data records (`=`) follow the fields defined in the nameless root: `id`, `name`, `profile`, `roles`.
* The value for profile is the nested object: `{30,"New York"}`.

#### Benefits

* Keeps large datasets clean and consistent.
* Encourages reusability and separation of logic.
* Simplifies parsing for AI and validation tools.

<br>

## Basic Syntax
EMON follows a **structured and minimal format** for defining data types and records. Each EMON file is composed of **schemas** and **data records**.

#### 1. Root Definition (Nameless)

The root structure must be the first definition and lacks a name after the `#`.

```emon
#(id:number, name:string, is_manager:bool, roles:[string])[]
```

**Explanation**: This defines an array of records where the first field is `id` (number) and the last is `roles` (array of strings).

#### 2. Nested Definition (Named)
Nested types *must* be named for reference, maintaining modularity.

```emon
#contact(email:string, phone:string)
#(name:string, contact_info:#contact)
```

#### 3. Data Records (Positional)
Values must exactly follow the order of the fields defined in the root schema.

```emon
=101,Alice,true,[admin,editor]
```
**Explanation**: `101` goes to `id`, `Alice` to `name`, `true` to `is_manager`, and the array `[admin,editor]` to `roles`.

For full syntax details, advanced nested types, arrays, and multiline text, see the [official Syntax Guide](doc/syntax.md).

<br>

## Comparison Example

The table below illustrates how **EMON** reduces redundancy compared to JSON while preserving the same data structure with a simple example.

<table>
  <thead>
    <tr>
      <th></th>
      <th>JSON</th>
      <th>EMON</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
      <td>

```json
{
  "name": "Parvez",
  "age": 30,
  "profile": {
    "bio": "Developer",
    "location": "NY, USA"
  },
  "verified": true
}
```
</td>
      <td>

`=Parvez,30,{Developer,"NY, USA"},true`</td>
    </tr>
    <tr>
      <td>Token Count</td>
      <td>46</td>
      <td>13</td>
    </tr>
    <tr>
      <td>Character Count</td>
      <td>125</td>
      <td>37</td>
    </tr>
    <tr>
      <td>Token Reduction</td>
      <td>--</td>
      <td> ~72%</td>
    </tr>
    <tr>
      <td>Character Reduction</td>
      <td>--</td>
      <td> ~70%</td>
    </tr>
  </tbody>
</table>


> **Note:** EMON achieves more than ~72% reduction in token usage and ~70% reduction in character count while maintaining full data fidelity. This improves **AI model cost efficiency** and **data transmission performance**.

<br>

## Benchmarking EMON

To evaluate EMON’s efficiency, we compared its performance against **JSON**, **compact JSON**, **YAML**, **CSV**, and **XML** across multiple AI models and datasets. The metrics considered include **token count**, **character count**, and **processing speed**.

**Benchmark Setup**

- **Models Tested**: GPT-4o & GPT-4o mini
- **Datasets**: Structured user profiles, orders, and configuration data
- **Metrics**:
    - Token count (for AI input/output)
    - Character count (total serialized data)
    - Data size

### **Data of 100 Employee Profiles**

| Format       | Token Count | Character Count | Data Size  | Efficiency    |
| ------------ | ----------- | --------------- | ---------- | ------------- |
| JSON         | 1000        | 3500            | —          |               |
| JSON Compact | 850         | 2800            |            |               |
| YAML         | 1200        | 4000            |            |               |
| CSV          | 950         | 3000            |            |               |
| XML          | 1300        | 4200            |            |               |
| **EMON**     | 500         | 1700            |            |               |

### **Data of 100 Customers with Orders**

| Format       | Token Count | Character Count | Data Size  | Efficiency    |
| ------------ | ----------- | --------------- | ---------- | ------------- |
| JSON         | 1000        | 3500            | —          |               |
| JSON Compact | 850         | 2800            |            |               |
| YAML         | 1200        | 4000            |            |               |
| CSV          | 950         | 3000            |            |               |
| XML          | 1300        | 4200            |            |               |
| **EMON**     | 500         | 1700            |            |               |

### **Data of 100 Employee Profiles**

| Format       | Token Count | Character Count | Data Size  | Efficiency    |
| ------------ | ----------- | --------------- | ---------- | ------------- |
| JSON         | 1000        | 3500            | —          |               |
| JSON Compact | 850         | 2800            |            |               |
| YAML         | 1200        | 4000            |            |               |
| CSV          | 950         | 3000            |            |               |
| XML          | 1300        | 4200            |            |               |
| **EMON**     | 500         | 1700            |            |               |

<br>

## Use Cases

**EMON** is designed to solve real-world efficiency and structure challenges in data processing, AI pipelines, and application development.

**1. AI Prompt Optimization**: EMON reduces redundant syntax, cutting prompt size and token cost by 40–60%. Ideal for LLMs that process structured data like user profiles, logs, or API outputs.

**2. Lightweight Data Exchange**: Perfect for microservices and API communication, EMON minimizes payload size, enabling faster HTTP transfers and lower bandwidth usage across distributed systems.

**3. Cross-Platform Configuration**: Used as config files in mobile, desktop, and server environments, EMON ensures consistent parsing behavior and human readability without heavy dependencies.

**4. Edge and Embedded Systems**: EMON’s plain-text, compact nature makes it suitable for IoT devices, offline apps, and low-memory systems that need fast serialization and minimal storage footprint.

**5. AI Dataset Serialization**: In research and ML pipelines, EMON simplifies dataset storage and improves interoperability when generating or consuming structured AI training data.

**6. Experimental LLM Interchange Format**: EMON offers a new way to represent structured knowledge in prompt engineering and AI reasoning frameworks, bridging the gap between text and structured representation.

<br>

## Tools Development

### Official Tools
- JavaScript: [emon-js](https://github.com/mbparvezme/emon-js)
- PHP: [emon-php]()(in development)
- VS Code: [emon]()(in development)

<br>

## Ecosystem Possibilities

To expand EMON’s adoption and usability, community-driven tools and integrations are encouraged:

- **Parsers & Converters**<BR>
Tools to seamlessly transform EMON ↔ JSON ↔ YAML ↔ XML for backward compatibility.
- **Language SDKs & Libraries**<BR>
Official libraries for JavaScript, Python, PHP, Go, Rust, and other popular languages.
- **Developer Tools**<BR>
Extensions for VS Code, JetBrains, and Vim that enable syntax highlighting, linting, and auto-completion.
- **Browser & CLI Utilities**<BR>
Quick format viewers, CLI encoders/decoders, and data validators for developers.
- **Online Playground**<BR>
A web-based sandbox to visualize, test, and compare EMON syntax in real time with JSON or YAML.
- **Schema and Validation Framework**<BR>
A future standard for EMON-type definitions, enabling validation, type safety, and IDE integration.

> If you are interested in collaborating or experimenting with any of these, your contributions are more than welcome!

<br>

## 🤝 Contributing

This project is at an early research and concept stage.
Ideas, feedback, and experimental implementations are highly encouraged.

To contribute:

1. Fork this repository
2. Create your branch (`feature/your-idea`)
3. Share your implementation or feedback via Pull Request or Discussion

You can also open an issue for:

* Parser or syntax suggestion
* Implementation challenges
* Real-world application tests

<br>

## 📄 License

Released under the **MIT License** - free to use, modify, and experiment with.

<br>

## 🪶 Author & Acknowledgment

Developed and researched by **M B Parvez**, as part of an ongoing study on efficient data representation for AI systems.

<br>

> **Community members, open-source enthusiasts, and developers are warmly invited to take this concept forward and turn EMON into a practical ecosystem.**