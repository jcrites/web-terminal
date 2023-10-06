---
layout: page
title: "Inspiration"
date: 2023-10-06 11:30 -0700
categories: [webterminal]
description: "Technologies and user experiences that inspire WebTerminal"
---

Let's explain what WebTerminal seeks to achieve by comparing it to other projects that have innovated in this space: [Nushell](https://www.nushell.sh/), [Mathematica](https://www.wolfram.com/mathematica/), and [Jupyter notebooks](https://jupyter.org/) (themselves inspired by Mathematica).

### Nushell

Nushell is an attempt to significantly improve the command-line shell. In Nushell, commands accept structured input, and produce structured output, such as lists and tables. Nushell is also a shell language designed to make manipulating this structured data easy.

Its capabilities can be concisely demonstrated with the following screenshot showing a sample command and its output: 

<p align="center">
     <img src="https://github.com/jcrites/web-terminal/assets/88504/afbdd67f-7e1c-44b0-8890-0868c9e27719">
</p>

This picture shows a command being run, `ls | where size > 10mb | sort-by modified`. The `ls` command produces table-like structured data; `where size > 10mb` filters rows based on their `size` column; and `sort-by modified` sorts them by the `modified` column. The output is displayed as a table, and demonstrates some semantic understanding of the content, e.g., displaying the modification time as "a year ago".

However, Nushell has a fundamental limtiation: it is designed to operate within existing character-based terminals. Nushell can't display data graphically or interactively.

WebTerminal aims to take advantage of the display powers of web technology, using WebView as the canvas.

### Mathematica & Jupyter

Mathematica may have been the first environment that implements the "notebook" UI model. Mathematica is an advanced notebook environment designed around mathematics and computation. Mathematica commands and their outputs are displayed visually, directly in the terminal-style interface:

<p align="center">
    <img src="https://github.com/jcrites/web-terminal/assets/88504/996a9558-ebc7-46bd-8e15-85670bec9fbb">
</p>

The output of commands can also be interactive, and users can interact with sliders and other widgets to manipulate it. Jupyter provides a similar experience: 

<p align="center">
    <img src="https://github.com/jcrites/web-terminal/assets/88504/d35aecda-635b-461d-b57b-6aa963c07fb9">
</p>

However, Mathematica and Jupyter are designed to be specialized tools; they are not designed or optimized to be a primary command-line interface. They are not the terminal that you use to run e.g. `git commit` or `npm` or `yarn` on another project. WebTerminal aims to accommodate these daily-driver use-cases while also providing an advanced UI.