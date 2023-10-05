# WebTerminal

This article is part of a series of design documents describing [WebTerminal](README.md).

## Structured Data

WebTerminal commands will consume and produce structured data (similar to Nushell and PowerShell).
In its simplest form, we might think of this data as JSON.
For example, a command like `ls` might produce the following data:

```json
[
  {"name": "a.txt", "type":"file", "size": 1234, "modified": "2001-01-01"},
  {"name": "b.txt", "type":"file", "size": 4567, "modified": "2002-02-02"},
  {"name": "c.txt", "type":"file", "size": 8901, "modified": "2003-03-03"}
]
```

### Semantic Information

Although we could use JSON as the underlying data format -- and we'll certainly support it -- we have the opportunity to consider
and select a more powerful data format. JSON alone doesn't make it easy to process data semantically.

Specifically, JSON data is untyped. Given a data structure like:

```json
{"name": "c.txt", "type":"file", "size": 8901, "modified": "2003-03-03"}
```

Then the value of the keys `name` and `modified` are both simply strings. The JSON data doesn't convey any semantic information about the fact that `name` is specifically a file name / file path, that `size` is a size in bytes, or that `modified` is a timestamp. Consequently, programs that process this output, such as the WebTerminal UI, do not have the opportunity to display these fields in intelligent ways.

An intelligent display might prefer to display the timestamp like "1 year ago" or the size as "8 KiB"; but to do this, we need more semantic information than is present.

### Amazon Ion

WebTerminal will explore using [Amazon Ion](https://amazon-ion.github.io/ion-docs/) as its fundamental data format. We might express the output of the `ls` command in the following way using Ion.

```ion
[
  { name: path::"a.txt", type: filetype::"file", size: bytes::1234, modified: 2001-01-01T},
  { name: path::"b.txt", type: filetype::"file", size: bytes::4567, modified: 2002-02-02T},
  { name: path::"c.txt", type: filetype::"file", size: bytes::8901, modified: 2003-03-03T},
]
```

Ion is a richly-typed, self-describing data format. It is a superset of JSON, and extends JSON 
with a type system that provides unambiguous semantics, as well as other features such as annotations, commtents,
long strings, binary values, symbols, and more.

In the example above:

* The `name` field contains an Ion `string` that is specifically described as a `path`
* The `type` field contains a `string` of type `filetype`.
* The `size` field contains an `int` of type `bytes`
* The `modified` field contains an Ion `timestamp`.

Because this semantic information is part of the data directly, it is possible for other programs such as the WebTerminal UI to take advantage of it. WebTerminal might, by default, display any `int::bytes` in a user friendly way like `10 MiB`; it might display any `timestamp` by default like `1 year ago`, and so on.

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
  {"name": "a.txt", "type":"file", "size": 1234, "modified": "2001-01-01"},
  {"name": "b.txt", "type":"file", "size": 4567, "modified": "2002-02-02"},
  {"name": "c.txt", "type":"file", "size": 8901, "modified": "2003-03-03"}
]
```

An Ion representation of this data in a WebTerminal environment might be:

```ion
[
  { name: path::"a.txt", type: filetype::"file", size: bytes::1234, modified: 2001-01-01T},
  { name: path::"b.txt", type: filetype::"file", size: bytes::4567, modified: 2002-02-02T},
  { name: path::"c.txt", type: filetype::"file", size: bytes::8901, modified: 2003-03-03T},
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

## Addendum: XML

We could try to model this data more semantically using XML, perhaps like:

```xml
<file>
    <name type="path">c.txt</name>
    <size type="bytes">8901</size>
    <modified type="timestamp">2003-03-03</modified>
</file>
```

In this example, the `type="path"`, `type="bytes"`, `type="timestamp"` fields additionally characterize the semantic types of the data. XML is capable of conveying the necessary semantic information, but the format does not seem advantageous when compared to Amazon Ion.