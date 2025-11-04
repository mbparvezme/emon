# Contributing to EMON

We welcome contributions to **EMON (Efficient Modular Object Notation)**! Whether it’s improving documentation, adding examples, fixing bugs, or enhancing tools, your help is valuable.

<br>

## 1. How to Contribute

### Reporting Issues

* Use the [GitHub Issues](https://github.com/mbparvezme/emon/issues) tab.
* Provide a clear description, steps to reproduce, and expected vs. actual behavior.
* Include EMON examples if relevant.

### Suggesting Features

* Open an issue with the `enhancement` label.
* Describe the feature, use cases, and benefits.
* Optionally, provide a small EMON snippet to illustrate the idea.

### Submitting Pull Requests

1. Fork the repository.
2. Create a new branch for your feature or fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and ensure code formatting is consistent.
4. Test your changes locally (see `tests/parser.test.js` for examples).
5. Commit with clear messages:

   ```bash
   git commit -m "Add description of your change"
   ```
6. Push your branch and open a pull request against `main`.

<br>

## 2. Coding Guidelines

* **Follow existing style**: Keep formatting, indentation, and naming consistent.
* **Documentation first**: Update docs if you add new features or examples.
* **Readable and simple code**: Keep parser/converter logic clear and modular.
* **No dependencies for basic tools**: Tests and tools should run without additional packages.

<br>

## 3. Documentation Contributions

* Docs are under `docs/` and `training/`.
* Examples are under `examples/`.
* Always link new examples or guides in `README.md` if relevant.

<br>

## 4. Testing

* Run simple tests with:

  ```bash
  node tests/parser.test.js
  ```
* Ensure EMON ↔ JSON conversions work correctly.
* Add new test cases for any new features.

<br>

## 5. Code of Conduct

* Be respectful and professional.
* Focus on constructive feedback.
* Contributions should align with the research and educational focus of EMON.

<br>

Thank you for helping improve EMON! Your contributions help make it easier for developers and AI researchers to use and experiment with structured data.