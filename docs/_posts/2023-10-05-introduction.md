---
layout: post
title: "Introduction to WebTerminal"
date: 2023-10-05 23:09 +0000
categories: webterminal
---

**WebTerminal is an effort to re-imagine the interactive command-line terminal using Web technology.**

**Author:** [Justin Crites](https://github.com/jcrites) ([HN](https://news.ycombinator.com/user?id=jcrites))
**Status:** Draft
**Version:** 1.4.1 (2023-10-05 13:58:00 PDT)

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