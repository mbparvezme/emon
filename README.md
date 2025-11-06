# EMON – Efficient Modular Object Notation

**EMON** is a compact, modular, and AI-friendly structured data format designed for research, AI pipelines, and human-readable configuration. It is ideal for training AI models and exchanging structured data efficiently.

<br>

## 🌍 Why EMON

JSON is simple and universal—but when used in AI contexts, every character matters.
The repeated keys, braces, and quotes not only make it verbose and consume unnecessary tokens in model inputs and outputs.

**EMON** rethinks this with:

* Compact and positional syntax
* Type-aware field definitions
* Minimal use of structural symbols
* Easy mapping to existing JSON data

<br>

> “The goal isn’t to replace JSON overnight, but to inspire a cleaner, more efficient way of structuring the data of tomorrow.”
> — *M B Parvez*

<br>

## ✨ Key Features

* **Efficient:** Reduces redundant characters and repetitive key names.
* **Modular:** Reusable structure definitions (`#user`, `#profile`, etc.).
* **Nested:** Naturally supports multi-level and mixed-type objects.
* **Readable:** Clean, minimal syntax without nested clutter.
* **Cross-Platform Ready:** Works easily in JavaScript, PHP, Python, and more.
* **AI-Friendly:** Optimized to save tokens when exchanging structured data.
* **Plain Text Format:** UTF-8 safe and easy to store or share anywhere.

<br>

## 🧩 Modularity

EMON encourages **modular and reusable type definitions**, allowing you to break large structures into smaller, maintainable parts. Each module (type) can be defined once and referenced anywhere - improving clarity and reducing duplication.

#### Examples
```emon
#user(id:number,name:string,contact:#contact)
#contact(email:string,phone:string)

=1,"M Luna",{luna@example.com,"+880100000000"}
```

#### How it works

* `#user` and `#contact` are defined separately.
* `#user` includes a nested reference to `#contact`.
* You can reuse `#contact` in multiple other definitions (e.g., `#employee`, `#vendor`).

#### Benefits

* Keeps large datasets clean and consistent
* Encourages reusability and separation of logic
* Simplifies parsing for AI and validation tools

<br>

## 📘 Basic Syntax

```emon
#user(name:string,age:number,profile:#profile,verified:bool)
#profile(bio:string,location:string)

=Parvez,30,{Developer,"NY, USA"},true
=Rafi,27,{Designer,"Dhaka, BD"},false
```
<br>

## 🔍 Comparison Example

| Concept          | JSON                                                                                                          | EMON                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Structure        | `{"name": "Parvez", "age": 30, "profile": { "bio": "Developer", "location": "NY, USA" }, "verified": true }` | `=Parvez,30,{Developer,"NY, USA"},true` |
| Character Count  | 118                                                                                                           | 48                                      |
| Token Efficiency | High usage                                                                                                    | ~50–60% reduced                         |

<br>

## 🔄 EMON ↔ JSON Conversion Example

**EMON**

```emon
#user(name:string,age:number)
=Parvez,30
```

**Converted JSON**

```json
{ "user": { "name": "Parvez", "age": 30 } }
```

**JSON → EMON**

```emon
#user(name:string,age:number)
=Parvez,30
```

<br>

## 🧠 Use Cases

* AI prompt formatting (reduce input/output tokens)
* Compact data exchange between microservices
* Config files for cross-platform apps
* Offline/embedded device data structure
* Experimental serialization format for LLM-based applications

<br>

## 🧩 Ecosystem Possibilities

To make EMON practical and accessible, we invite the community to build supporting tools around it:

* **Parsers & Converters** – Convert between EMON ↔ JSON ↔ YAML
* **Language Libraries** – JS, PHP, Python, Rust, Go, etc.
* **VS Code / JetBrains Plugins** – Syntax highlighting and autocompletion
* **Browser Extensions** – Format viewer and quick previewer
* **Online Playground** – Write, test, and convert EMON data interactively

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

Released under the **MIT License** — free to use, modify, and experiment with.

<br>

## 🪶 Author & Acknowledgment

Developed and researched by **M B Parvez**, as part of an ongoing study on efficient data representation for AI systems.

<br>

> **Community members, open-source enthusiasts, and developers are warmly invited to take this concept forward and turn EMON into a practical ecosystem.**