# Axonote: A Markdown-Native Mind Map DSL

## 1. Introduction

**Axonote** is a Domain-Specific Language (DSL) designed to facilitate the creation and representation of mind maps directly within Markdown documents. Its core philosophy is to leverage the simplicity and ubiquity of Markdown syntax, enabling users to generate complex mind maps with minimal learning overhead. Axonote is particularly well-suited for researchers, writers, and developers who wish to integrate structured visual thinking into their existing Markdown-based workflows.

## 2. Why Use Markdown for Mind Maps?

Integrating mind map creation into Markdown offers several compelling advantages:

1. **Familiarity and Simplicity**: Markdown is widely adopted and known for its easy-to-learn, human-readable syntax. Users don't need to learn a new complex tool or syntax.
2. **Plain Text Portability**: Axonote files are plain text (`.md`). This ensures maximum portability across different operating systems and devices. They are also inherently version-control friendly (e.g., with Git).
3. **Rich Tooling Ecosystem**: The vast ecosystem of Markdown editors, previewers, and converters can be leveraged. Many existing tools offer live previews, syntax highlighting, and export options.
4. **Content-Focused**: Markdown encourages focusing on content and structure rather than a*d hoc* visual styling, leading to more organized and meaningful mind maps.
5. **Seamless Integration**: Mind maps can live alongside other textual documentation, notes, or articles within the same file, providing context and reducing fragmentation.
6. **Extensibility**: Markdown's simplicity allows for straightforward extensions, as demonstrated by Axonote itself, to cater to specific needs like scientific citations.

## 3. Core Syntax

Axonote interprets specific Markdown patterns to construct a mind map. The fundamental building blocks are nodes and edges.

### 3.1. Node Definition

Every node in a Axonote mind map is declared using a Markdown heading syntax, typically starting with a single `#` followed by the node's name or title.

```markdown
# CentralIdea

Central Ideal Node

# KeyA

Key Concept A

# KeyB 

Key Concept B
```

The content immediately following a node definition (until the next node definition or an edge definition) is considered the content of that node. If the content is empty, the node is still valid and the content is the title itself.

### 3.2. Node Content Types

By default, the content associated with a node is parsed as standard Markdown (But we recommend that use only one pattern each time). This allows for rich text formatting, lists, code blocks, tables, mathematical expressions, and more directly within a node.

- **Text Node**: A node primarily containing plain text or rich text formatting.

  ```markdown
  # Introduction

  This node provides an overview of the topic.
  It can include **bold text**, _italics_, and `inline code`.
  ```

- **List Node**: A node containing ordered or unordered lists.

  ```markdown
  # Main Features

  - Feature 1: Description
  - Feature 2: Description
    1. Sub-point 2.1
    2. Sub-point 2.2
  - Feature 3: Description
  ```

- **Code Block Node**: A node showcasing a block of code.

  ````markdown
  # Algorithm Implementation

  ```python
  def factorial(n):
      if n == 0:
          return 1
      else:
          return n * factorial(n-1)
  print(factorial(5))
  ```
  ````

- **Table Node**: A node containing tabular data.

  ```markdown
  # Comparison Table

  | Feature     | Tool A | Tool B   |
  | ----------- | ------ | -------- |
  | Speed       | Fast   | Medium   |
  | Cost        | Free   | Paid     |
  | Ease of Use | Easy   | Moderate |
  ```

- **Mathematical Expression Node**: A node for displaying mathematical formulas (typically using LaTeX syntax).

  ```markdown
  # Quadratic Formula
  $$
  x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
  $$
  ```

- **Image Node**: A node that can embed images.

  ```markdown
  # System Architecture Diagram
  
  ![Architecture Diagram](path/to/architecture.png "System Overview")
  ```

### 3.3. Node Attributes and Styling

Axonote supports Pandoc-style header attributes to specify styling and other metadata for nodes. Attributes are enclosed in curly braces `{}` and placed immediately after the node heading.

**Syntax:**

- **ID**: Starts with `#` (e.g., `{#custom-id}`). Unique identifier for the node.
- **Classes**: Start with `.` (e.g., `.important .highlight`). Used for applying predefined sets of styles (often defined in an external CSS file).
- **Key-Value Pairs**: `key="value"` or `key=value` (if the value has no spaces). Used for specific styling properties.

```markdown
# Project Kickoff Meeting {#kickoff .milestone color="#4CAF50" textColor="white"}

This node has a custom ID "kickoff", is part of the "milestone" class,
and has a specific background and text color.

# Scope Definition {shape="hexagon" .critical border-color="red"}

This node will be styled with a hexagonal shape, a "critical" class,
and a red border.
```

**Commonly Used Attributes:**

- `id`: A unique identifier for the node.
- `class`: One or more class names for CSS styling.
- `color` / `background-color`: Node background color.
- `textColor` / `font-color`: Node text color.
- `shape`: Visual shape (e.g., `rectangle`, `ellipse`, `diamond`, `database`).
- `borderColor`: Color of the node's border.
- `borderWidth`: Thickness of the node's border.
- `fontSize`: Font size for the node's text.
- `icon`: An icon to display within or next to the node (e.g., `icon="⚠️"`).
- `link`: An external URL the node should link to.
- `position`: Positioning the node in the canvas, using `x` and `y` coordinates (e.g., `position="x=100,y=200"`, most time you don't need to do that manually).

**Linking External CSS:**
For more extensive and reusable styling, you can link an external CSS file via the YAML front matter. The Axonote renderer would then apply styles defined in this CSS file, particularly those targeting node classes or IDs.

```yaml
---
title: "My Styled Mind Map"
css: path/to/my-styles.css
---
# Styled Node {.custom-style-from-css}
This node will pick up styles defined for `.custom-style-from-css`
in `my-styles.css`.
```

### 3.4. Edge Definition and Hierarchy

Connections (edges) between nodes are established using Markdown's link syntax. An edge is defined within the content block of a source node, linking to a target node. The link text serves as the label for the edge.

The hierarchical structure of the mind map is implicitly defined by these connections. Typically, the first node defined in the document can be considered the root, and subsequent connections establish parent-child relationships.

```markdown
# Project Alpha (Root Node)

This is the main project.
It has several key components.

[Leads to](#Component1)
[Manages](#Component2)

# Component1

This is the first major component.

[Details](#SubComponent1A)

# SubComponent1A

Detailed aspect of Component 1.

# Component2

- Task X
- Task Y [More Info](#TaskYDetails)

# TaskYDetails

Further details about Task Y.
```

In this example:

- `Project Alpha` is the root node.
- `Project Alpha` is the parent of `Component1` (via "Leads to" edge) and `Component2` (via "Manages" edge).
- `Component1` is the parent of `SubComponent1A`.
- `Component2` is the parent of `TaskYDetails`.
- If the title contains spaces, you can replace them with `-`.
- If the title is long or contains special characters, you give them a unique ID using `{#unique-id}` syntax.

The parser will resolve these links to build the mind map structure. Nodes can be defined in any order, but links must refer to valid node names (the text following `#`).

## 4. BibLaTeX Integration for Scientific Mind Mapping

Axonote incorporates features specifically beneficial for academic and scientific mind mapping, notably integration with BibLaTeX for citations and bibliographies.

### 4.1. Bibliography Configuration

To enable BibLaTeX features, specify the path to your bibliography file (e.g., `.bib`) in the YAML front matter of your Markdown document:

```yaml
---
bibliography: path/to/my_references.bib
---
# My Research Topic
```

### 4.2. Citations within Nodes

You can embed citations within any node's content using the standard Pandoc citation syntax `[^citekey]` or `[^citekey]`. These nodes are treated as regular content nodes that happen to contain citation markers.

```markdown
# Literature Review

The foundational work by [^Author2020] established key principles.
Further research [see @AnotherAuthor2021; @YetAnother2022, p. 34] expanded on these.
This approach is discussed in [^Smith2019].
```

### 4.3. Dedicated Bibliography Nodes

A node containing _only_ one or more citation keys, without any other text, can be interpreted as a **Dedicated Bibliography Node**. The rendering of such a node might differ, potentially displaying more detailed bibliographic information directly or acting as a visual cue for a cited work.

```markdown
# Key Reference: Maxwell's Treatise

[^Maxwell1873]

# Influential Papers

[^Einstein1905]
[^Dirac1928]
```

The exact rendering behavior of such nodes would be determined by the Axonote parser/renderer implementation. It could, for instance, display the full reference or a snippet.

## 5. Example: A Complete Axonote Document

Here's a more comprehensive example showcasing various features:

```markdown
---
title: "Axonote Demo: The Solar System"
author: "CAIMEOX"
date: "2025-6-11"
bibliography: "references.bib" # Assume references.bib contains BibTeX entries
---

# The Solar System

Our solar system is a fascinating place, centered around a star we call the Sun.
It consists of planets, dwarf planets, moons, asteroids, and comets.

[Consists of](#Planets)
[Central Star](#Sun)
[Other Objects](#MinorBodies)

# Sun

The Sun is a G-type main-sequence star (G2V).
It accounts for about 99.86% of the total mass of the Solar System. [^NASA_SunFacts]

# Planets

There are eight planets in our Solar System.

[Inner Planets](#InnerPlanets)
[Outer Planets](#OuterPlanets)

# Inner Planets

- Mercury
- Venus
- Earth [Moon Details](#EarthsMoon)
- Mars

# EarthsMoon

The Earth's only natural satellite.
Plays a crucial role in Earth's tides.

# Outer Planets

1. Jupiter
   - Largest planet
   - Famous for its Great Red Spot
2. Saturn
   - Known for its ring system
3. Uranus
4. Neptune

# Minor Bodies

[Examples](#DwarfPlanets)
[More on Asteroids](#AsteroidBelt)

# DwarfPlanets

- Pluto
- Ceres
- Eris

# AsteroidBelt

Located roughly between the orbits of Mars and Jupiter.
```

### Example `references.bib` file

```bibtex
@misc{NASA_SunFacts,
  author = {{NASA}},
  title = {Sun Fact Sheet},
  year = {2023},
  howpublished = {\url{https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html}},
  note = {Accessed: 2023-10-27}
}

@book{Sagan1980,
  author    = {Sagan, Carl},
  title     = {Cosmos},
  publisher = {Random House},
  year      = {1980}
}
```
