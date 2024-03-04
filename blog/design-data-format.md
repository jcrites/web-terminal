# Design of WebTerminal

In this article, we'll examine a core design issue affecting the initial design of WebTerminal: data formats.

WebTerminal is an interactive, command-line environment where the output of commands is displayed richly using web browser technology, HTML/CSS/JS.
We envision a shell environment where programs might display their output in the richest way that makes sense; for example, using HTML to render
tables, lists, and other data in ways that are more user-friendly than plain text.

As a motivating example, imagine running a command like `ls`. In a `bash` shell, this output consists of text (simplified):

```
> ls
ls -l
total 96
jcrites  staff  15567 Feb  7 15:37 Cargo.lock
jcrites  staff    263 Feb  7 15:37 Cargo.toml
jcrites  staff   1026 Feb 11 18:37 main.rs
```

In WebTerminal, our display will be rich HTML; consequently, we (naively) seek the command's output to be displayed as HTML along the lines of:

```
<table>
  <tr>
    <th>User</th>
    <th>Group</th>
    <th>Size</th>
    <th>Date</th>
    <th>Name</th>
  </tr>
  <tr>
    <td>jcrites</td>
    <td>staff</td>
    <td>15567</td>
    <td>Feb 7 15:37</td>
    <td>Cargo.lock</td>
   </tr>
   <!-- ... -->
</table>
```

When examining this format, a number of problems become immediately apparent:

1. If commands produce this output verbatim, then the data will be inconvenient to process in further ways programmatically.

2. This straightforward HTML translation of the output of `ls` is fairly primitive and does not preserve semantic information. For example:

   1. Although the table has table-headers (`<th>`), they do not convey any semantic information,
   such as that `jcrites` is the file's owner, a username.
   2. It does not capture the fact that the number `15567` represents the number of bytes in a file – which the user might prefer to display as `16 KiB`, for example.
   3. This simple translation also preserves the format of `ls`'s timestamp, `Feb 7 15:37` which is an ad hoc representation 
   that is less useful for any subsequent display logic than a standardized timestamp would be (e.g. `2024-02-07T15:37` etc.); 
   the presentation layer might decide to display all timestamps in a particular time zone, and in a particular human-friendly way.

These problems suggest that the direct output from programs in a WebTerminal environment must be an intermediate 
format that is suitable for **both** subsequent programmatic processing **and** for rendering into HTML for display.

What *is* this intermediate data format?

We need a data format capable of representing the data's structure as well as its semantics;
we must know that `jcrites` is a file name, that `15567` is a file size in bytes, and that `main.rs` is the name of a file on disk.

We furthermore need a data format that is flexible. Although we *could* make this `ls` example work by specifying a
data format schema ahead of time, that the command will produce, this approach will make the system extremely difficult to extend.

We need a rendering paradigm that can suitably display the output of any conceivable command, without knowing the precise schema for its output ahead of time.
Consequently, the data format itself must carry its own rich semantic information.
By "rich", we mean that contains not just the fact that `jcrites` is a string, but that it's the file's username;
and that `15567` is not just a number but a size-in-bytes, and so on.

We can design a data format that preserves this information in a way that can be dynamically displayed in the UI and also dynamically processed programmatically.

