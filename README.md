## Introduction

**WebTerminal is an effort to re-imagine the interactive command-line terminal using Web technology.**

**Author:** [Justin Crites](https://github.com/jcrites) ([HN](https://news.ycombinator.com/user?id=jcrites))
**Status:** Draft
**Version:** 1.3.3 (2023-10-04 14:31:00 PDT)

### Elevator Pitch (TL;DR)

WebTerminal is a complete re-imagining of the command-line environment, designing it from the ground up to take full advantage of browser technology. As a simplification, WebTerminal is a developer tool that provides a command-line environment where programs display their output as HTML rendered into a WebView. Traditional terminals are limited to displaying grids of characters, but programs running in WebTerminal can produce any kind of rich output that a web browser can display – including full fledged UI widgets emplying HTML, CSS, and JavaScript.

### Rationale

The project originates from an observation: while web technologies have evolved substantially in recent decades, and have become the foundation for various applications and user experiences, the terminal has stagnated.

Traditional terminals, rooted in 1960s teletype technology, utilize characters and ANSI escape codes to render limited user interfaces, and their development has been somewhat arrested due backward compatibility and their inherently character-based output. The contrast with the modern Web is stark. WebTerminal seeks to innovate on the terminal experience by integrating modern Web technologies, using HTML, CSS, and JavaScript for display, along with a processing paradigm that can take advantage of them.

**Inspiration**: The ideas underlying this concept are not new, though our specific approach might be. To read more about related ideas, see below or the [Inspiration](#inspiration) section.

**Motivation:** WebTerminal is a technology that I wish existed, and wish that I could use, so I'm trying to create it. (Alternatives come close, but don't hit the mark.) My intention is to release this technology as open-source software; there is no commercial motivation or business deadline at the moment. I see this project as R&D work.

Let's explain what WebTerminal seeks to achieve by comparing it to other projects that have innovated in this space: [Nushell](https://www.nushell.sh/), [Mathematica](https://www.wolfram.com/mathematica/), and [Jupyter notebooks](https://jupyter.org/) (themselves inspired by Mathematica).

#### Nushell

Nushell is designed to be an interactive terminal environment, but with a twist. In Nushell, commands accept structured input, and produce structured output, such as lists and tables. Nushell can understand this structure, interact with it, and also render it somewhat visually. Its capabilities can be concisely demonstrated with the following screenshot showing a sample command and its output: 

<p align="center">
     <img src="https://github.com/jcrites/web-terminal/assets/88504/afbdd67f-7e1c-44b0-8890-0868c9e27719">
</p>

This picture shows a command being run, `ls | where size > 10mb | sort-by modified`. The output is displayed as a table, with some semantic understanding of the content (e.g. last modified time as "a year ago").

However, Nushell has a fundamental limtiation: it is designed to operate within existing character-based terminals. Nushell can't display data graphically or interactively. WebTerminal aims to take advantage of the display powers of web technology, using WebView as the canvas.

Nushell potentially could be adapted to work with a display provided by WebTerminal; however, it hasn't been designed with that experience in mind, and its data semantics are insufficiently precise to take full advantage of WebTerminal's intended display capabilities.

#### Mathematica & Jupyter

Mathematica may have been the first environment that implements the "notebook" UI model. Mathematica is an advanced notebook environment designed around mathematics and computation. Mathematica commands and their outputs are displayed visually, directly in the terminal-style interface:

<p align="center">
    <img src="https://github.com/jcrites/web-terminal/assets/88504/996a9558-ebc7-46bd-8e15-85670bec9fbb">
</p>

The output of commands can also be interactive, and users can interact with sliders and other widgets to manipulate it. Jupyter provides a similar experience: 

<p align="center">
    <img src="https://github.com/jcrites/web-terminal/assets/88504/d35aecda-635b-461d-b57b-6aa963c07fb9">
</p>

However, Mathematica and Jupyter are designed to be specialized tools; they are not designed or optimized to be a primary command-line interface. They are not the terminal that you use to run e.g. `git commit` or `npm` or `yarn` on another project. WebTerminal aims to accommodate these daily-driver use-cases while also providing an advanced UI.

## WebTerminal

In the WebTerminal project, we'll build on these concepts and extend them. (WebTerminal is a codename that we'll ideally replace with a unique product name.) Imagine a command-line terminal where the canvas is an HTML WebView, and the entire experience is designed to take advantage of that. The terminal will have advanced UI capabilities but still be useful as a primary daily-driver for typical software development.

When you run a command from the shell, it produces structured output (like JSON) that is rendered and displayed in the WebView. The terminal defines and understands common interfaces or shapes of data, such as lists and tables, as well as data types like file names or timestamps, and renders them intelligently as HTML, where the display environment takes full advantage of browser capabilities; programs are not limited to rendering "Terminal User Interfaces (TUIs)" made up by grids of characters. 

The terminal provides powerful interactivity and semantic understanding of data. Microformats will preserve data semantics into the UI, where style sheets and JavaScript will determine how each type of data is displayed. Data processing and display logic are decoupled: most programs will only produce structured in a standard format as output, but programs with unique needs may provide their own HTML/CSS/JS.

User interaction with WebTerminal will feel more like using an IDE than a traditional terminal. Since the terminal understands data semantics, it can provide features like Content Assist or Code Completion -- not only when passing input to programs, but interacting with their output too. For example, the terminal will understand that the output from `ls` is a list of files specifically. When the user hovers their mouse over a file name, the UI might display additional information about the file (like its size); or when the user clicks, it might display a contextual popup menu with actions like "Open File", "Copy Absolute Path", or "Git Diff".

The terminal may also allow programs to produce full-fledged, dynamic JavaScript objects as output (not just JSON), such that the user can directly interact with them in their shell -- assign them to a variable, invoke their methods, and pass them to other programs (a la PowerShell). 

## Approach

WebTerminal will likely be a [NodeJS](https://nodejs.org/en) application that uses [Electron](https://www.electronjs.org/) for its display. Since JavaScript is the de facto language of the Web, we'll also seek to use TypeScript as the primary programming language of the WebTerminal environment (with modifications). WebTerminal will be open source software. More details about its potential user experience and design follow.

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

### Structured Data

For a discussion of the data formats used by WebTerminal, and how these will power hypermedia documents, see [Structured Data](structured-data.md).

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

### Security

For a discussion of security and WebTerminal, see [Security](security.md).

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

### Success Criteria

1. A shell environment that uses a TypeScript-inspired language, and that is suitable for routine daily usage. Users will use it to run commands like `git commit`, `yarn`, or `npm` in their projects – as well as taking advantage of its more sophisticated capabilities. The user experience of basic commands like `ls`, `cd`, and so on will be crisp.
    1. To explore the product idea as an MVP, we can start by using TypeScript as the shell language as-is. It has significant rough edges compared to most shells, but is capable of functioning in the role.
    1. It may also be possible in principle to run a shell like `bash` or `zsh` within WebTerminal. In this case, although the shell language will not be aware of the capabilities of the terminal, individual programs run by the shell could still produce structured data as output, that is rendered using a WebView. There will likely be significant compatibility challenges to exploring this approach, however, since it may require "merging" the HTML/WebView rendering mode with traditional terminal emulation.
1. A terminal and terminal emulator. In addition to providing the WebView-powered UI experience described in this document, the terminal will, for backward compatibility, also function as a traditional terminal emulator, so that it can run shells like `bash` or `zsh` normally (such as when invoked within a container, or by `ssh` to another machine), as well as individual programs that might expect a terminal for their UI.
1. Suitable for all command-line purposes. Once the product is viable, early adopters will have no reason to fall back to traditional shells. (If they do, then the product is either not viable or is incomplete)
    1. It is OK on the other hand if notebook users of Mathematica and Jupyter fall back to those products for data science use-cases. We do want to support more of these use-cases over time, but we can't expect to up front. 

## Inspiration

WebTerminal is significantly inspired by:

1. [Nushell](https://www.nushell.sh/)
    1. [Nushell Nana](https://github.com/nushell/nana), an experimental graphical version of Nushell
3. [PowerShell](https://learn.microsoft.com/en-us/powershell/)

An understanding of WebTerminal will benefit significantly from an understanding of these technologies.
