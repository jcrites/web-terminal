---
layout: page
title: "Structured Data"
date: 2023-10-05 23:21 +0000
categories: [webterminal]
description: "How commands will use richly-typed, structured data to drive the hypermedia experience"
---

# WebTerminal

This article is part of a series of design documents describing WebTerminal. Consider starting with the [Introduction](introduction).

## Structured Data

[^1]: Similar to Nushell and PowerShell

WebTerminal commands will consume and produce structured data [^1].
The simplest form of this structured data might be JSON.

A command like `ls` in WebTerminal might produce the following raw data:

```json
[
  {"name": "a.txt", "type":"file",      "size": 1234, "modified": "2001-01-01"},
  {"name": "b.txt", "type":"file",      "size": 4567, "modified": "2002-02-02"},
  {"name": "d",     "type":"directory", "size": 8901, "modified": "2003-03-03"}
]
```

*(As we'll discuss below, JSON alone will not be sufficient to meet WebTerminal's needs, but it is a starting point for understanding our approach.)*

### Extensibility

WebTerminal's data layer is crucially designed with extensibility in mind.
One type of extensibility is separation of concerns: most programs only need to be concerned with producing structured data as their output, and need not concern themselves with how it's presented to the user. WebTerminal will render the structured data in a way that makes sense, given the user's context and preferences.

For example, WebTerminal might render raw JSON data above as an HTML table, mapping JSON fields to table columns:

| name | type | size | modified |
| --- | --- | --- | --- |
| `a.txt` | `file` | `1234` | `2020-01-01` |
| `b.txt` | `file` | `4567` | `2021-02-02`|
| `d` | `directory` | `8901` | `2022-03-03` |

WebTerminal's shell and UI will provide powerful general capabilities for working with structured data, similar to Nushell. (See [Nushell: Working with Tables](https://www.nushell.sh/book/working_with_tables.html)). However, whereas Nushell renders data using ASCII characters, WebTerminal will generally render them with HTML.

### The need for Semantic Data

Although WebTerminal is capable of displaying any raw structured data, we believe the default experience must be more intelligent. Given the data above, we seek for WebTerminal's default display experience to be something like:

| name | type | size | modified |
| --- | --- | --- | --- |
| `a.txt` | file | 1 KiB | 3 years ago |
| `b.txt` | file | 4 KiB | 2 years ago |
| `d` | directory | 8 KiB | 1 year ago |

#### UX Goals driven by Semantic Data

Some of our goals for the WebTerminal user experience, which place requirements on our data formats, include:

1. It will understand that `a.txt` and `b.txt` are file paths, and will provide contextual intelligence. For example, if the user clicks on a file name, WebTerminal should provide a popup menu with options like "Open File" and "Copy Absolute Path".
2. It may know that the `type` column represents an enumeration, and that `file` and `directory` are the two possible values.
3. It will understand that the `size` column contains sizes in bytes. It will display them in a human-friendly way like `1 KiB` instead of `1234`. A user can click an icon in the table header and toggle human-friendly display on and off. If the user clicks on the file size and selects "Copy", then the clipboard will copy the raw value `1234`. 
4. It will understand that the `modified` column contains timestamps, and will display them in a human-friendly way like `1 year ago` instead of `2022-03-03`. Like with file sizes, the user can toggle this on and off and copy raw values.

Many additional forms of intelligence are desirable and possible with a strong semantic understanding of data.

The article [Structured Hypermedia](structured-hypermedia) discusses how we will specifically achieve these goals using our structured data.

#### Non-Solutions

What we **aren't** going to do is build logic into WebTerminal that directly understands the type of data produced as output from every command like `ls`. 

This approach *could* certainly work: WebTerminal could be aware of each such command, and aware of the schema of its output data. With this knowledge, WebTerminal could parse fields of JSON output and overlay semantics onto them.

However, this approach is not extensible. It's not desirable for WebTerminal to need to know about every command that might be run and its data schema. We seek a stronger solution where extensibility is an automatic or emergent property of the design. We will likely provide support for overlaying semantics onto existing data, but this won't be the native way to build or integrate programs into WebTerminal.

#### JSON is Insufficient

We can't effectively raise the bar on user experience if programs output structured data using JSON alone. JSON is weakly-typed and provides no semantic information. Consider the hypothetical JSON output of an `ls` command:

```json
{"name": "b.txt", "type":"file",      "size": 4567, "modified": "2002-02-02"},
{"name": "d",     "type":"directory", "size": 8901, "modified": "2003-03-03"}
```

This format presents a number of obstacles:

1. The fields `name`, `type`, and `modified` all simply contain JSON strings. The data itself contains no additional information beyond this. A human can make inferences about what these contain, but not a machine.
2. The field `size` is a JSON number. Nothing more specific, such that it's an integer or a size in bytes.

With a data format like this, we cannot achieve our [user experience goals](#ux-goals-driven-by-semantic-data).

Consequently, we seek a "primary" data format that the WebTerminal shell and compatible programs can use to fully convey relevant semantic information. With this semantic information, we there are many opportunities to enrich the user experience, as we'll discuss in [Richly Typed Hypermedia](#richly-typed-hypermedia).

### Amazon Ion

WebTerminal will explore using [Amazon Ion](https://amazon-ion.github.io/ion-docs/) as its fundamental data format, which offers a number of advantages compared to alternatives. Ion is a richly-typed, self-describing data format that extends JSON with precise types, annotations, symbols, binary values, and more.

Using Ion, an `ls` program might produce the following output.

```ion
[
  {
    name:     path::"a.txt",
    type:     filetype::"file",
    size:     bytes::1234,
    modified: 2001-01-01T
  },
  {
    name:     path::"b.txt",
    type:     filetype::"file",
    size:     bytes::4567,
    modified: 2002-02-02T
  }, // ...
]
```

#### Semantic Data in Ion

This Ion representation contains data with more precision and with semantic information that is not available in JSON. The data demonstrates the use of three Ion data types (`string`, `int`, `timestamp`) and the use of annotations to describe semantics (`path::`, `bytes::`).

Specifically:

* `name`: a field with a value of type `string` and the annotation `path`.
* `type`: a `string` with annotation `filetype`.
* `size`: a field with an `int` value and the annotation `bytes`.
* `modified`: a field containing an Ion `timestamp`, and no annotation (since `timestamp` is sufficiently self-describing)

Ion annotations play a key role in conveying the semantics of our data. From the [Ion specification](https://amazon-ion.github.io/ion-docs/docs/spec.html#annot):

> Any Ion value can include one or more annotation symbols denoting the semantics of the content. This can be used to:
> * Annotate individual values with schema types, for validation purposes.
> * Associate a higher-level datatype (e.g. a Java class) during serialization processes.
> * Indicate the notation used within a blob or clob value.
> * Apply other application semantics to a single value.
>
> Except for a small number of predefined system annotations, Ion itself neither defines nor validates such annotations; that behavior is left to applications or tools (such as schema validators).

The example uses annotations to describe when a `string` represents a file path, and when an `int` represents a size in bytes.

Ion isn't limited to representing only strings and numbers; it can express a [variety of data types](#ion-types): : `string`, `timestamp`, `int`, `decimal`, `float`, `symbol`, `blob`, `annotation`, and more.

Because this semantic information is part of the data directly, it is possible for other programs such as the WebTerminal UI to take advantage of it. WebTerminal might, by default, display any `int::bytes` in a user friendly way like `10 MiB`; it might display any `timestamp` by default like `1 year ago`, and so on.

However, programs can still interact with this Ion data structurally even if they are not concerned with annotations at all. Given the Ion records above, a program can access the field `.name` as a string or `.size` as an int without concern for annotations. This makes general-purpose querying and transformation convenient.

It is our belief that Ion offers a better user experience for essentially all use-cases than alternatives. We're open to being convinced of alternatives.

## Next

The next article, [Structured Hypermedia](structured-hypermedia) the series discusses how this structured data will drive WebTerminal's hypermedia experience.

## Appendix: Ion Alternatives

### JSON

We discussed in above why JSON is insufficient alone to express the semantic information we require in program outputs, and why we need Ion.

Consider our example of `ls` output in Ion:

```ion
[
  { name: path::"a.txt", type: filetype::"file",      size: bytes::1234, modified: 2001-01-01T},
  { name: path::"b.txt", type: filetype::"file",      size: bytes::4567, modified: 2002-02-02T},
  { name: path::"d",     type: filetype::"directory", size: bytes::8901, modified: 2003-03-03T},
]
```

One could argue that we *can* find a way to represent this in JSON, but it will be tortured and have significant disadvantages. For example, we could devise a custom JSON format that preserves this semantic information, by making every "value" a structure with a value `v` and type `t`:

```json
[
  {
    "name": {"v": "a.txt", "t":"string::path"},
    "type": {"v": "file", "t":"string::filetype"},
    "size": {"v": 1234, "t":"int::bytes"},
    "modified": {"v": "2001-01-01T", "t": "timestamp"},
  },
  {
    "name": {"v": "b.txt", "t":"string::path"},
    "type": {"v": "file", "t":"string::filetype"},
    "size": {"v": 4567, "t":"int::bytes"},
    "modified": {"v": "2002-02-02T", "t": "timestamp"},
  },
  {
    "name": {"v": "d", "t":"string::path"},
    "type": {"v": "directory", "t":"string::filetype"},
    "size": {"v": 1234, "t":"int::bytes"},
    "modified": {"v": "2003-03-03T", "t": "timestamp"},
  },
]
```

Although a format like this could work for driving a rich UI experience, it will be highly inconvenient both to produce and consume using code. The type/value representation will infect every level of every data structure. It will be especially challenging to handle data that contains type/value representation for some fields in the data structure and not others.

Ion handles all of these situations with ease. For example, given the following Ion content:

```ion
[
  { name: path::"a.txt", type: filetype::"file",      size: bytes::1234, modified: 2001-01-01T},
  { name: path::"b.txt", type: filetype::"file",      size: bytes::4567, modified: 2002-02-02T},
  { name: path::"d",     type: filetype::"directory", size: bytes::8901, modified: 2003-03-03T},
]
```

Although every value contains an annotation like `name: path::"a.txt"`, general-purpose code is not required to understand the annotation in order to interact with it. For example, a program like `cat data.ion | where name == "a.txt"` can access the `.name` property of each record in a way that's agnostic to its annotation.

Any program (such as general purpose data manipulation programs) that does not care about annotations can interact with the Ion data exactly as if it were:

```ion
[
  { name: "a.txt", type: "file",      size: 1234, modified: 2001-01-01T},
  { name: "b.txt", type: "file",      size: 4567, modified: 2002-02-02T},
  { name: "d",     type: "directory", size: 8901, modified: 2003-03-03T},
]
```

Yet programs that *do* understand the annotations, such as the WebTerminal rendering logic, can take advantage of them. Programs can also handle data that contains a mix of fields with annotations and fields without annotations -- this doesn't change the shape of the data (unlike in our JSON example where fields must be expressed as composites with `v`/`t` components).

### XML

XML is capable of modeling our data semantically. We might employ an approach like:

```xml
<file>
    <name type="path">c.txt</name>
    <size type="bytes">8901</size>
    <type type="filetype">file</type>
    <modified type="timestamp">2003-03-03</modified>
</file>
```

In this example, the `type="path"`, `type="bytes"`, `type="timestamp"` fields additionally characterize the semantic types of the data.

However, XML has disadvantages compare to Ion. It doesn't have any built in concepts akin to [Ion Types](#ion-types). As a text format, it's arguably less convenient to work with compared to JSON and Ion. Ion also provides a compact binary format suitable for reasonably large data sets (though not as compact as protocols expressly designed for this purpose like [Apache Parquet](https://parquet.apache.org/))