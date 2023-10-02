# web-terminal
A next generation terminal and shell environment

## Motivation

I've been ruminating over the idea of a next-generation terminal environment for some time. My call to action came from reading an article published by Eric S. Raymond, [Things Every Hacker Once Knew](http://www.catb.org/~esr/faqs/things-every-hacker-once-knew/). In it, ESR discusses the history of terminal environments, including teletypes (TTY) and video display terminals (VDTs), and how these take advantage of ASCII to display text content on the screen.

What stood out to me from the history is how our modern terminal environments are *still* based on these now-ancient technologies. In nearly all other spheres of software development, we've moved forward by leaps and bounds. We now have an extremely rich and powerful display environment, the modern Web, and Web browsers. Yet the terminal environment is still rooted in technology developed in the 1960s.

**Web Terminal** is an effort to re-imagine the terminal and shell environment using modern, 2020s technologies.j

## Inspiration

* [PowerShell](https://learn.microsoft.com/en-us/powershell/)
* [Nushell](https://www.nushell.sh/)

## Design Principles

1. Web-based Display. The Web Terminal will use Web technologies to display content to the user (HTML, etc.). Content can take advantage of the full gamut of web technologies, including hypermedia.

2. Dynamic. As a Web-based content environment, the terminal will support dynamic JavaScript-based presentation.

## Architecture


## Ideas

### TypeScript-Native Shell

JavaScript is the programming language of the Web. As a Web-fluent terminal, terminal scripting will use JavaScript, specifically TypeScript.

TypeScript seems close to having the features necessary to provide convenient terminal scripting. For example, consider [Zx](https://github.com/google/zx) and [Dax](https://github.com/dsherret/dax).

**Dax Example**

```typescript
const result = await $`echo 1`.text();
console.log(result); // 1

const result = await $`echo '{ "prop": 5 }'`.json();
console.log(result.prop); // 5

const result = await $`echo 1 && echo 2`.lines();
console.log(result); // ["1", "2"]
```

**Zx Example**

```typescript
#!/usr/bin/env zx

await $`cat package.json | grep name`

let branch = await $`git branch --show-current`
await $`dep deploy --branch=${branch}`

await Promise.all([
  $`sleep 1; echo 1`,
  $`sleep 2; echo 2`,
  $`sleep 3; echo 3`,
])

let name = 'foo bar'
await $`mkdir /tmp/${name}`
```

These get us pretty close to the convenience necessary for command-line scripting.

One major exception is for use with an interactive terminal. We might want different handling of string literals so that it's possible to, within a TS terminal, directly invoke native commands like `git commit`. Specifically, in an interactive terminal, the user does not want to write something like ``await $`git commit` `` to invoke a common command.

This might require a modified version of TS that interprets naked tokens like `git` as commands to invoke `git` from `PATH`. We might need to introduce a symbol like `$` to indicate when the user is referring to a variable defined in the shell -- much like bash and zsh do with their `$FOO` syntax.

## Richly Typed Shell Environment

Our shell environment can do much better than processing byte streams. Data will be richly typed and self-describing. [Ion](https://amazon-ion.github.io/ion-docs/) seems like a strong candidate, unless there is a better alternative. Ion offers the benefit of being richly-typed while also having both text and binary representations. Ion is also compatible with JSON, which is convenient.

For example, timestamps returned by programs will use the `timestamp` data type. A path on the system might be a `string` with an annotation, e.g. `path::"./foo.txt"`. Ideally all program input/output will be structured in this way.

For example, the output of `ls -l` might be:

```json
{
  entries: [
    {
      type: "file",
      permissions: "-rw-r--r--",
      links: 1,
      owner: "user",
      group: "staff",
      size: 1234,
      modified: 2023-10-02T09:00:00Z,
      name: "file1.txt"
    },
    {
      type: "directory",
      permissions: "drwxr-xr-x",
      links: 4,
      owner: "user",
      group: "staff",
      size: 128,
      modified: 2023-10-02T09:00:00Z,
      name: "directory1"
    }
  ]
}
```

(However, this will be rendered and not displayed as such)

## Rich Content Display

The Web Terminal doesn't just display text data; it's a full-fledged user interface. By default, program output is rendered in the most useful way. For example, any list of objects can be displayed as a table:

```
{
  entries: [
    {
      a: "A1",
      b: "B1",
      c: "C1
    },
    {
      a: "A2",
      b: "B2",
      c: "C2
    },
  ]
}
```

| a | b | c |
| --- | --- | --- |
| a1 | b1 | c1 |
| a2 | b2 | c2 |
|---|---|---|
