## Introduction

WebTerminal is an effort to re-imagine the interactive terminal using Web technology.

The WebTerminal project originates from a crucial observation: while web technologies have evolved, becoming a vital and vibrant hub for various applications and user interactions through browsers and hypermedia, the terminal has not paralleled this progression.

Traditional terminals, rooted in 1960s teletype technology, utilize characters and ANSI escape codes to render limited user interfaces, and their development has been somewhat arrested due to strict adherence to backward compatibility and its inherently character-based output.
The contrast with the graphical and interactive nature of web technology is stark. 

WebTerminal seeks to innovate by integrating modern web technologies—HTML, CSS, and JavaScript—enabling the terminal to break free from its restrictive, character-bound past.

Our objective is to harness the interactive, graphical, and programmable capacities of web technologies to enhance, modernize, and elevate the terminal environment, providing developers with a rich, user-friendly, and highly flexible interface.

### In a nutshell

The Nushell project website demonstrates its value by showing a simple command and output:

![image](https://github.com/jcrites/web-terminal/assets/88504/c6baa658-c4ec-4c3c-b792-36c64d424056)

In WebShell, we'll support a similar command, with a rich hypermedia output.
The shell will be TypeScript inspired, with extensions:

```typescript
ls()
  .where(f => f.size > 10mb) // filter()
  .orderBy(f => f.modified)
```

_(We can improve upon this syntax, discussed below.)_

The output of this program will be structured data in Amazon Ion format (discussed below):

```
[
  {name:"x86_64-linux-gnu-lto-dump-10", type:"file", size: 23300000, modified: 2022-10-03T12:00:00},
  {name:"micro", type:"file", size: 13700000, modified: 2022-12-03T12:00:00},
  {name:"buildah", type:"file", size: 19800000, modified: 2023-03-03T12:00:00},
  {name:"qemu-system-i386", type:"file", size: 13700000, modified: 2023-05-03T12:00:00},
  {name:"qemu-system-x86_64", type:"file", size: 13700000, modified: 2023-10-03T12:00:00},
  {name:"node", type:"file", size: 76600000, modified: 2023-09-03T12:00:00},
]
```

(In fact, the output will likely employ annotations, like `name: path::"node"`, `size: bytes::23300000`, etc. as described below.)

WebShell will render this output as an HTML table that might display to the user like so:

| name | type | size | modified |
| --- | --- | --- | --- |
| x86_64-linux-gnu-lto-dump-10 | file | 23.3 MiB | a year ago |
| micro | file | 13.7 MiB | 8 months ago |
| buildah | file | 19.8 MiB | 7 months ago |
| qemu-system-i386 | file | 13.7 MiB | 5 months ago |
| qemu-system-x86_64 | file | 13.7 MiB | 5 month ago |
| node | file | 76.6 MiB | a month ago |

```html
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Type</th>
      <th>Size (bytes)</th>
      <th>Last Modified</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>x86_64-linux-gnu-lto-dump-10</td>
      <td>file</td>
      <td>23,300,000</td>
      <td>2022-10-03T12:00:00</td>
    </tr>
    <tr>
      <td>micro</td>
      <td>file</td>
      <td>13,700,000</td>
      <td>2022-12-03T12:00:00</td>
    </tr>
    <tr>
      <td>buildah</td>
      <td>file</td>
      <td>19,800,000</td>
      <td>2023-03-03T12:00:00</td>
    </tr>
    <tr>
      <td>qemu-system-i386</td>
      <td>file</td>
      <td>13,700,000</td>
      <td>2023-05-03T12:00:00</td>
    </tr>
    <tr>
      <td>qemu-system-x86_64</td>
      <td>file</td>
      <td>13,700,000</td>
      <td>2023-10-03T12:00:00</td>
    </tr>
    <tr>
      <td>node</td>
      <td>file</td>
      <td>76,600,000</td>
      <td>2023-09-03T12:00:00</td>
    </tr>
  </tbody>
</table>
```

#### Improved TypeScript shell notation

Some alternative syntaxes we might aim to support:

```typescript
// Pipeline notation
ls | where(f => f.size > 10mb) | orderBy (f => f.modified)

// Concise anonymous functions
ls | where( _.size > 10mb) | orderBy( _.modified )

// Simplified anonymous functions
ls | where(size > 10mb) | orderBy(modified)

// Methods without parentheses
ls | where size > 10mb | orderBy modified
```

Achieving this brevity will require some modifications to the TypeScript language.
Modifying the language in this way is certainly *possible*.
However, since it's not absolutely essential to explore the idea of WebTerminal, we will set this aside and return to it elsewhere.

## Approach

### Web-based content display

Just like a Web browser displays a web page, WebTerminal will display the terminal
using web technology, as a browser-style environment (a la [Electron](https://www.electronjs.org/)).
It will take advantage of HTML, CSS, and JS to display content like lists, tables, and images. It might employ JavaScript to display interactive widgets.

#### Tabular Data

WebTerminal will have powerful support for displaying and manipulating data as lists and tables. For inspiration, consider how Nushell displays a list:

```
> [sam fred george]
╭───┬────────╮
│ 0 │ sam    │
│ 1 │ fred   │
│ 2 │ george │
╰───┴────────╯
```

WebTerminal will render the same data as an HTML list:

1. `sam`
2. `fred`
3. `george`

WebTerminal will also support complex structured data. Programs may produce structures (aka records) consisting of name/value pairs; 
they might produce tables containing lists of structures. Consider how Nushell displays a list of JSON records as a table:

```
> [{name: sam, rank: 10}, {name: bob, rank: 7}]
╭───┬──────┬──────╮
│ # │ name │ rank │
├───┼──────┼──────┤
│ 0 │ sam  │   10 │
│ 1 │ bob  │    7 │
╰───┴──────┴──────╯
```

WebTerminal will render this structure as an HTML table:

| # | name | rank |
| --- | --- | --- |
| 0 | sam | 10 |
| 1 | bob | 7 |

By thoughtfully designing the type of data that WebTerminal commands produce and consume, we can supercharge the user experience.

#### Multimedia

WebTerminal programs can also display typical multimedia as output.
For example, one command might take table containing data points as input, and might render its output as a chart or graph.
This picture will be displayed directly within the WebTerminal as the program's output.

#### Interactive

WebTerminal displays are not static. When a program displays a chart or graph, we should provide support so that it can be dynamic and interactive.
For example, a user might mouse-over and then scroll to zoom in or zoom out on a graph. They might click-and-drag to pan (translate) it.
The graph might have dynamic axes, so that if the user zooms in or out, they are not simply zooming on a static picture:
the graph data itself moves, but the axes remain in position, and they update themselves according to the borders of the display.

When the user interacts with dynamic content and manipulates it, the UI might display convenience options to:

1. Copy the image to the clipboard (as a picture)
2. Copy the underlying data to the clipboard (as text)
3. Save the data or image to a file
4. Duplicate the display element, so that the user can see the original while manipulating a copy.
5. Revert an element to its original value.
6. Crop data according to the display.
    
    For example, if a user pans or zooms a graph, then they might crop the underlying data set to exclude any values that are outside the display boundary.
    They might subsequently perform any of the above operations on this cropped data.

These are some simple examples of how data might be interactive. Ultimately, we want WebTerminal to be designed so that the same
powerful patterns of dynamic, interactive content from the Web will also work in the terminal environment.

### Richly Typed, Structured Data

WebTerminal commands will consume and produce structured data, similar to Nushell and PowerShell.
In its simplest form, we might think of this data as JSON.
For example, a command like `ls` might produce the following data:

```json
[
  {"name": "a.txt", "type":"file", "size": 1234, "modified": "2001-01-01"},
  {"name": "b.txt", "type":"file", "size": 4567, "modified": "2002-02-02"},
  {"name": "c.txt", "type":"file", "size": 8901, "modified": "2003-03-03"}
]
```

#### Ion Types

Although we could use JSON as the underlying data format -- and we'll certainly support it -- we have the opportunity to consider
and select a more powerful data format. To that end, WebTerminal will explore using [Amazon Ion](https://amazon-ion.github.io/ion-docs/)
as its fundamental data format.

Ion is a richly-typed, self-describing data format. Its text format is a superset of JSON, and extends JSON 
with a type system that provides unambiguous semantics, as well as other features such as annotations, commtents,
long strings, binary values, symbols, and more. Example Ion data types and values:

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

Notably, each of the fields in these structures has an annotation.

1. `name` expresses file names as a `string` with a `path::` annotation.
2. `type` is a `string` with a `filetype::` annotation
3. `size` is an `int` with a `bytes::` annotation
4. `modified` is a `timestamp`

(It's worth noting that `foo::` annotations in Ion don't have any predetermined meaning, any more than a field name like `{a:1}` has meaning.
However, the meaning of annotations can be established by convention and context, as discussed below.)

The WebTerminal environment will take advantage of these types and their annotations to enrich the user experience.

### Interactive, Richly Typed Hypermedia

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

### Interactive Data Manipulation

It should be possible for the user to manipulate data in-place if they wish, either for analysis, to save it to a file, or to pass it as input to another program.

Imagine that a program produces a simple table as output:

```
[
  {name: "sam", rank: 10},
  {name: "bob", rank: 7}
]
```

WebTerminal will render this structure as an HTML table:

| # | name | rank |
| --- | --- | --- |
| 0 | sam | 10 |
| 1 | bob | 7 |

If the user clicks on the table, then a UI might appear that is inspired by the spreadsheet editing experience. For example:

* Interactively edit cells within the table
* Add or remove rows/columns
  * There might be a specific experience for "marking a row as deleted", which changes its color or display somehow, but doesn't actually remove the row.
  * Similarly, when hovering over a cell that has changed since the original, the UI might display the original value.
* Duplicate the table
* Revert the table to its original values
* Save the table to a file (as Ion, JSON, CSV, etc.)
* Load the table with `$EDITOR`
* Facilitate passing the table as input to another command

Each in-place change of the data in the table might invisibly create a new "version" of the table data. This will support a full undo/redo experience.
(Perhaps this experience is even backed by a small, automatically managed `git` repository? 
In this way, the user could "export" the table to a file, and also export their history of edits to the table as a series of Git commits)

### TypeScript language

JavaScript is the language of the Web, and we aim to employ TypeScript as the interactive and shell language for WebTerminal.

The shell experience might be inspired by the libraries [Dax](https://github.com/dsherret/dax) and [Zx](https://github.com/google/zx).

For an initial prototype of WebTerminal, we can use TypeScript as-is in an interactive capacity.
However, TypeScript (and JavaScript) aren't really suitable for being interactive shells.
Specifically, the user needs to be able to enter commands in a simple way, like `cat foo.txt`.
When they do this, both the command to run `cat` and its argument `foo.txt` are naked strings.

The [Nushell language called Nu](https://www.nushell.sh/book/nu_as_a_shell.html) is well designed with this constraint in mind.

Using the Dax library, executing a command can be *relatively* simple: ``await $`cat foo.txt` `` -- but this is still too much boilerplate for an interactive shell.
Thus, the final form of WebTerminal might incorporate a modified variant of TypeScript designed for interactive usage.

This variant might interpret "command" literals as programs to run, e.g. `cat foo.txt`.
It might access TypeScript variables `foo` using the notation `$foo`.

The Dax and Zx libraries also require the use of `await`, as in ``let branch = await $`git branch --show-current` ``.
Perhaps we can automatically `await` some promises when in interactive mode.

### Architecture

The architecture of WebTerminal has yet to really be designed. For inspiration, we might draw from [Crux](https://redbadger.github.io/crux/).

Crux is an experimental approach to building cross-platform applications with good testability, code and behavior reuse, security, etc.
Its architecture consists of a "Core" system built in Rust, which drives business logic, and a "Shell" that provides all interfaces
to the external world, including the human user.



## Inspiration

WebTerminal is significantly inspired by:

1. [Nushell](https://www.nushell.sh/)
2. [PowerShell](https://learn.microsoft.com/en-us/powershell/)

An understanding of WebTerminal will benefit significantly from an understanding of these technologies.
