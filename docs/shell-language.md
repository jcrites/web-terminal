---
layout: page
title: "Shell Language"
date: 2023-10-06 10:32 -0700
categories: [webterminal]
description: "The experience of WebTerminal's interactive shell language"
---

# WebTerminal

This is a design and requirements document for the shell language of [WebTerminal](README.md).

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
