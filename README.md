## Introduction

**WebTerminal is an effort to re-imagine the interactive command-line terminal using Web technology.**

**Author:** [Justin Crites](https://github.com/jcrites) ([HN](https://news.ycombinator.com/user?id=jcrites))
**Status:** Draft
**Version:** 1.0.2 (2023-10-04 12:40:00 PDT)

### Elevator Pitch

Imagine a command-line terminal where the canvas is an HTML WebView. Running commands from the shell results in appending new HTML into the WebView DOM.

Programs will output structured data, like lists and tables. The terminal intelligently renders them as HTM.
Programs can display any kind of graphical content or supported by HTML - they aren't limited to rendering "Terminal User Interfaces (TUIs)" using grids of characters. The terminal gains the full powers of a full-fledged web browser. Beyond simple structured data like tables, programs can output rich visual data, such as charts and graphs. The terminal environment will facilitate visualizing complex data (such as lists of data points).

**Inspiration**: The ideas underlying this concept are not new, though our specific approach might be. To read more about related ideas, see below or the [Inspiration](#inspiration) section.

**Motivation:** WebTerminal is a technology that I wish existed, and wish that I could use, so I'm trying to create it. (Alternatives come close, but don't hit the mark.) My intention is to release this technology as open-source software; there is no commercial motivation or business deadline at the moment. I see this project as R&D work.

### Rationale

The project originates from an observation: while web technologies have evolved substantially in recent decades, and have become the foundation for various applications and user experiences, the terminal has stagnated.

Traditional terminals, rooted in 1960s teletype technology, utilize characters and ANSI escape codes to render limited user interfaces, and their development has been somewhat arrested due backward compatibility and their inherently character-based output. The contrast with the modern Web is stark. WebTerminal seeks to innovate on the terminal experience by integrating modern Web technologies, using HTML, CSS, and JavaScript for display, along with a processing paradigm that can take advantage of them.

Let's explain what WebTerminal seeks to achieve by comparing it to other projects that have innovated in this space: [Nushell](https://www.nushell.sh/), [Mathematica](https://www.wolfram.com/mathematica/), and [Jupyter notebooks](https://jupyter.org/) (themselves inspired by Mathematica).

#### Nushell

Nushell is designed to be an interactive terminal environment, but with a twist. In Nushell, commands accept structured input, and produce structured output, such as lists and tables. Nushell can understand this structure, interact with it, and also render it somewhat visually. Its capabilities can be concisely demonstrated with the following screenshot showing a sample command and its output: 

<p align="center">
     <img src="https://github.com/jcrites/web-terminal/assets/88504/afbdd67f-7e1c-44b0-8890-0868c9e27719">
</p>

This picture shows a command being run, `ls | where size > 10mb | sort-by modified`. The output is displayed as a table, with some semantic understanding of the content (e.g. last modified time as "a year ago").

#### Mathematica & Jupyter

Mathematica may have been the first environment that implements the "notebook" UI model. Mathematica is an advanced notebook environment designed around mathematics and computation. Mathematica commands and their outputs are displayed visually, directly in the terminal-style interface:

<p align="center">
    <img src="https://github.com/jcrites/web-terminal/assets/88504/996a9558-ebc7-46bd-8e15-85670bec9fbb">
</p>

The output of commands can also be interactive, and users can interact with sliders and other widgets to manipulate it. Jupyter provides a similar experience: 

<p align="center">
    <img src="https://github.com/jcrites/web-terminal/assets/88504/d35aecda-635b-461d-b57b-6aa963c07fb9">
</p>

## WebTerminal

In the WebTerminal project, we'll build on these concepts and extend them. (WebTerminal is a codename that we'll ideally replace with a unique product name.)

WebTerminal is designed to be an interactive, command-line style environment that takes full advantage of the display technologies of web browsers. Specifically, WebTerminal's display canvas will be an HTML WebView. The output of commands will be rendered and displayed as HTML, making it possible for commands to produce structured lists, tables, and rich visual media.

WebTerminal will likely be a [NodeJS](https://nodejs.org/en) application that uses [Electron](https://www.electronjs.org/) for its display. Since JavaScript is the de facto language of the Web, we'll also seek to use TypeScript as the primary programming language of the WebTerminal environment (with modifications). WebTerminal will be open source software.

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

### Extensible

WebTerminal might provide a wide variety of built-in rendering functions capable of transforming types of Ion data into HTML. However, its architecture likely needs to be designed with extensibility in mind.

For example, we might provide support for displaying a list of values as a chart, or a set of (X, Y) data points. The chart used to display simple data should ideally be built in.

However, it should be possible for someone to build an extension that supports more powerful charting. This extension might be installed at the WebTerminal level.

It might also be possible for individual programs, that are run from the command line, to provide their own JavaScript. These programs might run and render their content like a web page, in fact; that is, they might return Ion data as output, and also accompany it with their own style sheets, and their own `<script>` tags that can load JavaScript. In this way, displaying the output of a program is like rendering a web page. It can take advantage of all the dynamic capabilities of the Web.

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
and select a more powerful data format. JSON alone doesn't make it easy to process data semantically, per the requirements discussed above.

WebTerminal will explore using [Amazon Ion](https://amazon-ion.github.io/ion-docs/) as its fundamental data format.

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

### Structured Data

WebTerminal will decouple program processing logic from the presentation layer. Just as in Nushell, commands will process structured data. (Nushell uses JSON). WebTerminal will take responsibility for rendering the structured data as HTML into a UI.

The raw output of the `ls` program in WebTerminal will be a table, represented as a list of structures in the [Amazon Ion data format](https://amazon-ion.github.io/ion-docs/):

```
[
  {
    name: path::"x86_64-linux-gnu-lto-dump-10",
    type: file_type::"file",
    size: bytes::23300000,
    modified: 2022-10-03T12:00:00
  },
  {
    name: path::"micro",
    type: file_type::"file",
    size: bytes::13700000,
    modified: 2022-12-03T12:00:00
  },
  // ...
]
```

For more on the rationale of using Amazon Ion as this data format, see [Richly Typed Structured Data](#richly-typed-structured-data).

### User Interface

WebTerminal will evaluate this structured data according to semantic formatting logic, and then will render it into HTML and display it using a WebView. The HTML that's displayed might look like:

| name | type | size | modified |
| --- | --- | --- | --- |
| x86_64-linux-gnu-lto-dump-10 | file | 23.3 MiB | a year ago |
| micro | file | 13.7 MiB | 8 months ago |
| buildah | file | 19.8 MiB | 7 months ago |
| qemu-system-i386 | file | 13.7 MiB | 5 months ago |
| qemu-system-x86_64 | file | 13.7 MiB | 5 month ago |
| node | file | 76.6 MiB | a month ago |

The HTML data underlying this table will employ attributes and microformats so as to preserve semantic data into the UI layer. The HTML used to display this table might be:

```html
<table>
  <thead>
    <tr>
      <th>name</th>
      <th>type</th>
      <th>size (bytes)</th>
      <th>modified</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="path"
        data-cwd="/users/alice"
        data-abs-path="/users/alice/x86_64-linux-gnu-lto-dump-10">
        x86_64-linux-gnu-lto-dump-10
      </td>
    </tr>
    <tr>
      <td class="file_type">file</td>
      <td class="bytes" data-raw="23300000">23.3 MiB</td>
      <td>
          <time class="modified-time" datetime="2022-01-01T18:00:00Z">1 year ago</time>
      </td>
    </tr>
    <!-- ... -->
  </tbody>
</table>
```

Notably:

1. The file path `path::"x86_64-linux-gnu-lto-dump-10"` has been understood as a file path, and rendered as an HTML element with `class="path"`, so that file-specific styles can be attached to it.
2. File paths can be relative. WebTerminal also captured the current working directory when this file path was produced, using `data-cwd`.
3. WebTerminal might also calculate its guess of the file's absolute path and convey it as `data-abs-path`.
4. The file size in bytes is rendered as a human-friendly string `23.3 MiB`. However, the raw file size in bytes is also available to the UI.
5. The timestamp is displayed as the human-friendly `1 year ago`. However, the raw timestamp is also available to the UI.

Since WebTerminal has a semantic understanding of the output, it can behave intelligently. For example, example, even if the user changes their current directory, WebTerminal can still operate correctly on file paths that were displayed as relative paths. If the user clicks on a file and selects "Open in Editor", WebTerminal will open the user's `EDITOR` on that file even if the current working directory has changed (and the original relative path is no longer valid). Similarly, user can click on a friendly size like `23.3 MiB` and select "Copy", which might copy the raw size in bytes (e.g. `23300000`). When copying a timestamp like `1 year ago`, the clipboard might receive a precise timestamp like `2022-01-01T18:00:00Z`.

These are just some of the intelligent behaviors that WebTerminal can exhibit using structured data formats and a semantic understanding of program output.

WebTerminal also aims to decouple the logic of data processing from rendering and UI. Programs can be designed to simply consume and produce structured data, without being especially concerned how that will be displayed to users (within the bounds of what WebTerminal rendering and stylesheets are designed to accommodate).

### Data Formats

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

### Shell Language

JavaScript is the language of the Web, and we aim to employ TypeScript as the interactive and shell language for WebTerminal.

A WebTerminal can function, in principle, using regular TypeScript notation. However, it won't be very convenient for an interactive shell environment. Consequently, we might develop a variant of TypeScript that's intended for interactive command-line usage. (The [Nushell language called Nu](https://www.nushell.sh/book/nu_as_a_shell.html) is well designed with these constraints in mind.)

In particular, we might improve on TypeScript syntax with the following refinements:

```typescript
// Original TypeScript
ls().where(f => f.size > 10*1024*1024).orderBy(f => f.modified)

// Supporting data types like "mb" or "mib" for megabytes out-of-the-box
// (viz. Nushell)
ls().where(f => f.size > 10mb).orderBy(f => f.modified)

// Supporting pipeline-style notation
ls | where(f => f.size > 10mib) | orderBy (f => f.modified)

// Concise anonymous functions
ls | where( _.size > 10mib) | orderBy( _.modified )

// Even more concise anonymous functions
ls | where(size > 10mib) | orderBy(modified)

// Methods without parentheses
ls | where size > 10mib | orderBy modified
```

With these series of refinements, the language starts to look a lot more like a traditional shell language.

We'll also need to support executing existing programs on the user's system, such as `git`. Although we might build support for many commands into the WebTerminal system directly, such as traditional GNU coreutils like `cd`, `ls`, etc., we can't assume that *every* program the user wants to run will be built-in. A shell must conveniently execute any program.

If the user enters `git` as a command, then we should run the `git` program from their `PATH`. To support this, we'll need a notation that accepts naked words and understands them as commands and arguments. For example, `cat foo.txt` should ideally be a valid command.

To support this, we may need to differentiate between "commands" and references to TypeScript variables (including functions). A command like `cd foo` or `ls` will probably invoke built-in logic that handles `cd` and `ls`. A command like `git` will likely need to invoke the `git` executable, and pass it whatever arguments follow. This means commands will not be valid TypeScript syntax, e.g. `git pull --rebase origin/mainline`.

We might design a variant of TypeScript to support this in some way. Specifically, perhaps any expression will (need to) support a top level series of tokens that will be interpreted as a command. If the user wants to access TypeScript variables, then perhaps they will prepend a sigil like `$` to them. Any symbol that doesn't include a `$` might be treated as a string constant, such that a command like `git pull --rebase origin/mainline` is interpreted as `["git", "pull", "--rebase", "origin/mainline"]` and passed to the command handler.

How exactly we'll need to modify TypeScript to support this is unclear. However, we can fully prototype WebTerminal while using TypeScript exactly as it is; it just won't be a convenient interactive language.

The shell experience might be inspired by the libraries [Dax](https://github.com/dsherret/dax) and [Zx](https://github.com/google/zx).


### Integrated & 3rd Party Commands

Building on the User Interface section above

Programs will need to integrate with WebTerminal and produce output in its format in order for users to experience the full benefits. A prototype might implement a subset of common commands, like `ls`, `cd`, `find`, etc. For the terminal to be successful and maximally useful, however, it will need to bundle programs providing all of the functionality that users expect (viz. Gnu coreutils).

If WebTerminal were successfully adopted in a widespread way, then 3rd party programs might offer support for producing output in its format. WebTerminal might need an integration mode where it can query a program to determine if it has WebTerminal support. If it does not, then the program's output will be treated as a stream of bytes (with support for parsing this as JSON, CSV, etc.) If the program does have WebTerminal support, then the program will be asked to produce output in WebTerminal format (which might be Ion + CSS + JS).

Nushell (by comparison) does not provide integration with 3rd party programs. For a prototype of WebTerminal we don't need to either; however, we should design it so that it is possible for WebTerminal to eventually invoke arbitrary executables while sending/receiving structured WebTerminal data.

In the simplest interaction mode, programs run by WebTerminal could accept Ion data as input and produce it as output. In a more sophisticated integration mode, WebTerminal could communicate with programs in the style of an HTTP server over stdin/stdout. This would make it possible for programs to return hypermedia documents in response to commands, such that output can reference hyperlinks to stylesheets or dynamic JavaScript served by the program, and rendered by the WebTerminal display.

Integrating with programs in this way also makes it possible for output to be displayed in real-time. For example, a WebTerminal equivalent of `top` or `htop` could function as a mini-web-page, with client-side JavaScript running that periodically queries the `htop` server for CPU Utilization information to display. Similarly, a long running program could display a progress bar to the client, which updates according to output from the program.

By using an HTTP style of interaction with programs, we can also simultaneously communicate over multiple data channels and control channels (modeled as concurrent HTTP requests, specifically HTTP/2 requests). That is, an expensive program launched as an HTTP-style server might produce a large volume of data as output in response to a request, while also communicating status to the UI using another concurrent series of requests/responses.

This communication could occur simply by running the HTTP/2 protocol over `stdin`/`stdout`, or could occur by running the program as a local TCP server and making multiple concurrent requests to it.

### Architecture

The architecture of WebTerminal has yet to really be designed. For inspiration, we might draw from [Crux](https://redbadger.github.io/crux/).

### Further Exploration

The document above describes how programs will consume and produce structured data, like Ion objects, instead of byte streams. However, we can go further than that: **it should be possible, in principle, for programs to produce and consume actual *JavaScript objects*, that is, including dynamic behavior implemented as methods.**

For example, imagine that you invoke a command that you've never used before, and that isn't built into WebTerminal: `foo`, and this command returns an object. Not only can we see the object's properties, but we could see and invoke its methods too. Thus I might be able to write code (something) like:

```javascript
let var = foo();
foo.do_something()
```

... where the `foo.do_something()` expression invokes a method that has dynamically been provided by invoking the program `foo`.

**How would this work?** The same way it does in a web page. If we consider the proposed integration architecture above, where WebTerminal executes a program like a browser talks to a web server, then the response of executing program `foo` might be a static set of data -- but a static set of data accompanied by a `<script>` tag which loads JavaScript dynamically to execute in the context that consumes it (either by including the code inline, or with a script URL that references the locally-run `foo` HTTP server).

This ability to load code dynamically might be one way that programs can customize the UI that they display: loading JavaScript into the UI along the data to be displayed. However, this JavaScript could also be loaded into the WebTerminal shell environment too. Thus, running a program like `foo()` can return full-fledged JavaScript objects into the shell environment that calls it.

Similarly, we might invoke some program `bar` and pass it an object (or list of them) as input. The program `bar` might expect that its input objects will implement a particular TypeScript interface, and will behave properly as long as they do. This is a step beyond merely expecting that data passed as input adheres to some JSON Schema or Ion Schema, for example.

This might provide a principal way of extending the WebTerminal environment. WebTerminal *itself* doesn't need to provide every command built-in if programs can extend it in this way.

This concept of passing actual JavaScript objects as data (that is, not just JSON) is similar to how I understand the PowerShell environment operates: where actual .NET objects can be returned by programs or passed into them.

## Inspiration

WebTerminal is significantly inspired by:

1. [Nushell](https://www.nushell.sh/)
    1. [Nushell Nana](https://github.com/nushell/nana), an experimental graphical version of Nushell
3. [PowerShell](https://learn.microsoft.com/en-us/powershell/)

An understanding of WebTerminal will benefit significantly from an understanding of these technologies.
