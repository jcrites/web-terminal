# WebTerminal

This article is part of a series of design documents describing [WebTerminal](README.md).

## Structured Data

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

As we'll discuss below, JSON alone will not be sufficient to meet WebTerminal's needs, but it is a starting point.

### Extensibility

WebTerminal's data layer is crucially designed with extensibility in mind.
One type of extensibility is separation of concerns: most programs only need to be concerned with producing structured data as their output, and need not concern themselves with how it's presented to the user. WebTerminal will render the structured data in a way that makes sense for the user, given user preferences and context.

For example, WebTerminal might render this JSON data as a table, mapping JSON fields to table columns.

| name | type | size | modified |
| --- | --- | --- | --- |
| `a.txt` | `file` | `1234` | `2020-01-01` |
| `b.txt` | `file` | `4567` | `2021-02-02`|
| `d` | `directory` | `8901` | `2022-03-03` |

The type of experience we'd like for generalized structured data in WebTerminal is similar to the Nushell experience working with tables. See [Nushell: Working with Tables](https://www.nushell.sh/book/working_with_tables.html). Whereas Nushell renders in the terminal using ASCII characters, WebTerminal will generally render them with HTML. With this approach, WebTerminal can render any general-purpose structured data in a reasonably useful way.

### The need for Semantic Data

We can provide a substantially better, more specific user experience by incorporating additional semantics into the data itself. We have loftier goals for the WebTerminal user experience of running `ls`.

Given a potential raw display of the output:

| name | type | size | modified |
| --- | --- | --- | --- |
| `a.txt` | `file` | `1234` | `2020-01-01` |
| `b.txt` | `file` | `4567` | `2021-02-02`|
| `d` | `directory` | `8901` | `2022-03-03` |

We have the following goals for the WebTerminal user experience:

1. It will understand that `a.txt` and `b.txt` are files (file names), and will be capable of providing contextual intelligence. For example, if the user clicks on a file name, WebTerminal should provide a popup menu with options like "Open File" and "Copy Absolute Path".
2. It may know that the `type` column represents an enumeration, and that `file` and `directory` are the two possible values.
3. It will understand that the `size` column contains sizes in bytes. It can display them in a human-friendly way like `1 KiB` instead of `1234`. A user can click an icon in the table header and toggle human-friendly display on and off. If the user clicks on the file size and selects "Copy", then the clipboard will copy the raw value `1234`. 
4. It will understand that the `modified` column contains timestamps, and will display them in a human-friendly way like `1 year ago` instead of `2022-03-03`. Like with file sizes, the user can toggle this on and off and copy raw values.

Many additional forms of intelligence are desirable and possible with a strong semantic understanding of data.

#### Non-Solution

What we *aren't* going to do is build logic into WebTerminal that directly understands the type of data produced as output from every command like `ls`. This approach could certainly work: WebTerminal could be aware of each such command, and aware of the schema of its output data. With this knowledge, WebTerminal could parse fields of JSON output and overlay semantics onto them.

However, this approach is not extensible. It's not desirable for WebTerminal to need to know about every command that might be run and its data schema. We seek a stronger solution where extensibility is an automatic or emergent property of the design.

(To clarify, we may indeed support just such an approach of overlaying semantics onto the output of existing programs. This will be advantageous for supporting existing popular programs that users want to use, that have not themselves been integrate with WebTerminal. However, we want to raise the bar for what's possible in developing and using command-line programs: we seek an approach that is inherently flexible and extensible.)

#### JSON is Insufficient

We can't effectively raise the bar on user experience if programs output structured data using JSON. JSON is weakly-typed and provides no semantic information. Consider the hypothetical JSON output of an `ls` command:

```json
{"name": "b.txt", "type":"file",      "size": 4567, "modified": "2002-02-02"},
{"name": "d",     "type":"directory", "size": 8901, "modified": "2003-03-03"}
```

This format presents a number of obstacles, such as:

1. The fields `name`, `type`, and `modified` all simply contain JSON strings. The data itself contains no additional information beyond this. A human can make inferences about what these contain, but not a machine.
2. The field `size` is a JSON number. Nothing more specific, such that it's an integer or a size in bytes.

We seek a data format that programs can use with WebTerminal that fully conveys all relevant semantic information. With this semantic information, we there are many opportunities to enrich the user experience, discussed in in [Richly Typed Hypermedia](#richly-typed-hypermedia).

### Amazon Ion

WebTerminal will explore using [Amazon Ion](https://amazon-ion.github.io/ion-docs/) as its fundamental data format. Ion offers a number of advantages over alternative formats that we will discuss. Ion is a richly-typed, self-describing data format that extends JSON with precise types, annotations, symbols, binary values, and more. Using Ion, an `ls` program might produce the following output:

```ion
[
  {
    name: path::"a.txt",
    type: filetype::"file",
    size: bytes::1234,
    modified: 2001-01-01T
  },
  {
    name: path::"b.txt",
    type: filetype::"file",
    size: bytes::4567,
    modified: 2002-02-02T
  }, // ...
]
```

The Ion representation contains data with more precision and with semantic information that is not available in JSON:

1. The `name` field contains an Ion `string` with with annotation `path`.
2. The `type` field contains a `string` with the annotation `filetype` (an enum of `file` and `directory`).
3. The `size` field contains an Ion `int` with the annotation `bytes`.
4. The `modified` field contains an Ion `timestamp`.

Ion isn't limited to representing only strings and numbers; it can express a [variety of data types](#ion-types) described below.

Because this semantic information is part of the data directly, it is possible for other programs such as the WebTerminal UI to take advantage of it. WebTerminal might, by default, display any `int::bytes` in a user friendly way like `10 MiB`; it might display any `timestamp` by default like `1 year ago`, and so on.

However, a program can *still* interact with this data even if it doesn't understand the meaning of the augmented types like `string::path`, `string::filetype`, `int::bytes`, and `timestamp`: a program that doesn't care about these can ignore the `::path` annotation and access `name` and `type` as `string`s, and `size` as an `int`, and so on.

Ion also offers a convenient, human-friendly textual representation (demonstrated above) that is just as convenient as JSON to work with. It also offers a compact, efficient binary format, and a way to convert between them. Alternative formats don't provide these capabilities.

It is our belief that Ion offers a better user experience for essentially all use-cases than alternatives. We're open to being convinced of alternatives, but 

#### Ion Types

Some more detail about Ion data types:

1. **`string`**. `"hello, world"`
1. **`timestamp`**. `2003-12-01T`, `2010-03-22T18:00:00Z`, `2019-05-01T18:12:53.472-0800`
2. **`int`**: arbitrary sized integers.  `0`, `-1`, `12345678901234567890...`
3. **`decimal`**: arbitrary precision real numbers. E.g. `0.`, `-1.2`, `3.141592653589793238...`, `6.62607015d-34`.
4. **`float`**: IEEE-754 32/64 bit. `0e0`, `-1.2e0`, `6.02e23`, `-inf`
5. **`symbol`**: efficient encoding of frequent strings.  `inches`, `dollars`, `'high-priority'`
6. **`blob`**: binary data. `{{ aGVsbG8= }}`
7. **`annotation`**: metadata associated with a value. `dollars::100.0`, `height::inches::72`, `lotto_numbers::[7, 9, 19, 40, 32, 44]`
8. **`null`**: distinct null values for every core type. `null`, `null.timestamp`, `null.int`.
9. **`struct`**: Structures are unordered collections of name/value pairs called fields. `{}`, `{x : 1, }` `{first:"Tom", last: "Riddle"}`

#### Ion Structures

Typed Ion fields can be composed into structures:

```ion
{ name: "a.txt" }                          // Struct with a string
{ name: "a.txt", }                         // Trailing comma is legal in Ion (unlike JSON)
{ name: "a.txt", size: 1024 }              // int type
{ name: "a.txt", modified: `2003-12-01T` } // timestamp type
{ name: "a.txt", writable: true }          // boolean
{center:{x:1.0, y:12.5}, radius:3}         // Nested struct
{ name: null, size: null.
{ "":42 }                           // A struct value containing a field with an empty name
{ x:1, x:null.int }                 // WARNING: repeated name 'x' leads to undefined behavior
{ x:1, , }
```

Using Ion for the data format makes it possible to convey common concepts like timestamps precisely, i.e. `2003-12-01T`. We can also convey other concepts like file paths or currency using annotations, e.g. `path::"foo.txt" or `dollars::10.5`. Some of these annotations might be defined by the WebTerminal environment, while others might be defined by specific programs and used only by their display logic.

#### Meaningful Data

Consider the hypothetical output of an `ls` command that we showed previously, formatted as JSON:

```json
[
  {"name": "a.txt", "type":"file",      "size": 1234, "modified": "2001-01-01"},
  {"name": "b.txt", "type":"file",      "size": 4567, "modified": "2002-02-02"},
  {"name": "d",     "type":"directory", "size": 8901, "modified": "2003-03-03"}
]
```

An Ion representation of this data in a WebTerminal environment might be:

```ion
[
  { name: path::"a.txt", type: filetype::"file",      size: bytes::1234, modified: 2001-01-01T},
  { name: path::"b.txt", type: filetype::"file",      size: bytes::4567, modified: 2002-02-02T},
  { name: path::"d",     type: filetype::"directory", size: bytes::8901, modified: 2003-03-03T},
]
```

Notably, each of the fields in these structures has either a precise type or an annotation.

1. `name` expresses file names as a `string` with a `path::` annotation.
2. `type` is a `string` with a `filetype::` annotation
3. `size` is an `int` with a `bytes::` annotation
4. `modified` is a `timestamp`

(It's worth noting that `foo::` annotations in Ion don't have any predetermined meaning, any more than a field name like `{a:1}` has meaning.
However, the meaning of annotations can be established by convention and context, as discussed below.)

The WebTerminal environment will take advantage of these types and their annotations to enrich the user experience.

### Richly Typed Hypermedia

#### Data Formats

##### File Paths

In the WebTerminal environment, strings with the `path::` annotation represent files on disk.
By employing this annotation, programs can unambiguously express file names in their output;
and the WebTerminal UI will react to it and provide an intelligent experience.

When rendering a value like `path::"foo.txt"` for display as HTML, WebTerminal might
employ `data-*` microformats to capture the file's absolute path, and/or the
current working directory when the path was produced as output.
For example, if the user's current working directory is `/users/alice`, and a program
produces a filename as output like `path::"foo.txt"`, then WebTerminal might render this in HTML as:

```html
<span class="path"
  data-cwd="/users/alice/"
  data-abs-path="/users/alice/foo.txt">
  foo.txt
</span>
```

The element has a unique `class="path"` which is applied to `path::` values. It also has an
element `data-cwd=` capturing the current working directory when the path was produced,
as well as a `data-abs-path=` capturing the file's absolute path.

Since files are displayed with `class="path"`, the UI can intelligently style the element
and display actions relevant to files, such as:

1. Copy as relative path (`./foo.txt`)
2. Copy as absolute path (`/users/alice/foo.txt`)
3. Open the file using `$EDITOR`
4. Navigate to the file
5. An extended mouse-over of the file name might display a brief preview of the file contents

Even if the user changes their working directory, these functions will still operate correctly.

##### File Size

WebTerminal will take advantage of the `bytes` annotation on file sizes, e.g. `size: bytes::1048576`, to display the value in a human-readable way.
For example, when a program outputs a value like `size: bytes::1048576`, then WebTerminal might render it as the human-readable `1 MiB` using the following HTML:

```html
<span class="size"
  data-raw="1048576">
  1 MiB
</span>
```

This HTML element displays the human-formatted `1 MiB`, but also contains the raw value `1048576`.
When the user clicks on the element, then the UI might present an option to copy the raw value as well.

##### Timestamps

Ion directly provides a `timestamp` type, so whenever a program displays time outputs, WebTerminal can display them intelligently.

For example, a timestamp value like `2022-01-01T18:00:00Z` might display as `1 year ago`.

```html
<time class="modified-time"
  datetime="2022-01-01T18:00:00Z>
  1 year ago
>
```

Similarly to file sizes, clicking on the value will allow the user to copy the raw timestamp value to the clipboard.

#### Customizable Hypermedia Content and Style

Since WebTerminal employs typed and tagged output formats, the standard terminal environment can render stylized output using CSS in ways that are most useful to the user.
Additionally, the user might customize their environment by supplying their own CSS style sheets. For example, the user might style the HTML elements described above:

```css
.path {
    color: blue;
    cursor: pointer;
}
.path:hover {
    text-decoration: underline;
}
.size {
  font-weight: bold;
}
.modified-time {
    color: grey;
}
```

## Ion Alternatives

### JSON

We discussed in [Semantic Information](#semantic-information) why JSON is insufficient alone to express the semantic information we require in program outputs, and why we need Ion. Example `ls` output:

```ion
[
  { name: path::"a.txt", type: filetype::"file",      size: bytes::1234, modified: 2001-01-01T},
  { name: path::"b.txt", type: filetype::"file",      size: bytes::4567, modified: 2002-02-02T},
  { name: path::"d",     type: filetype::"directory", size: bytes::8901, modified: 2003-03-03T},
]
```

One could argue that we *can* find a way to represent this in JSON, but it will be tortured and have significant advantages. For example, we could devise a custom JSON format that preserves this semantic information, by making every "value" a structure with a value `v` and type `t`:

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

### XML

We could try to model this data more semantically using XML, perhaps like:

```xml
<file>
    <name type="path">c.txt</name>
    <size type="bytes">8901</size>
    <modified type="timestamp">2003-03-03</modified>
</file>
```

In this example, the `type="path"`, `type="bytes"`, `type="timestamp"` fields additionally characterize the semantic types of the data. XML is capable of conveying the necessary semantic information, but the format does not seem advantageous when compared to Amazon Ion.