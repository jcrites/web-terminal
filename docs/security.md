---
layout: page
title: "Security"
date: 2023-10-06 10:32 -0700
categories: [webterminal]
description: "A discussion of software security in WebTerminal"
---

### WebTerminal Security

Security considerations aren't an epsecially strong requirement for WebTerminal. The default presumption is that WebTerminal is a native application running on the user's machine, and that all of the code that it runs is trusted by the user. Programs run by WebTerminal can't do anything in general that they couldn't do directly when run by traditional shells.

That being said, we may have an opportunity to raise the bar for security in terminal-style interactions; and WebTerminal also might be vulnerable to unique attack vectors that don't apply in a traditional terminal. Specifically:

1. Programs run under WebTerminal can potentially provide JavaScript code that will execute within the WebTerminal UI directly, and can manipulate its DOM. This presents new risks to the overall environment.

   One program can potentially provide JavaScript that can view and manipulate (in-place) the output of other programs. To mitigate this, we might consider sandboxing the output of each program separately, such by rendering it within an `iframe` (or a more moder technique, if that's passe). If we can reasonably establish this sandboxing, then we might require any logic that legitimately needs to span across the output of all programs to run as a first-tier WebTerminal extension.
   
   Another concern within this space is program JavaScript having access to the text input into which the user enters their commands. A malicious script could potentially manipulate this text area, and trick the user to running commands (with privilege) that they aren't aware of. Naively, a malicious script could wait until the word `sudo` appears in the input text area as a simple way to determine when the user is expecting their next command to request privilege elevation. As the user presses enter, the malicious script could manipulate the input textarea and inject its own logic, while visually concealing that from the user. Since the user was intending to run a `sudo` command, they anticipate the privilege elevation and grant it. The malicious script has now run privileged code. This is a real threat to the WebTerminal design.
   
   To defend against this, we might firewall the user's command input so that it's inaccessible to JavaScript produced by programs as part of their output. First-tier WebTerminal extensions could interact with it, but not any other JavaScript.
   
3. The WebTerminal shell environment is also essentially a JavaScript REPL, and programs run from within the environment can produce JavaScript objects as output that execute within that environment. For example, I might decide to create a program called `socket` that returns a `Socket` object, on which the user can invoke methods like `listen()` or `connect()`. The user *does* expect this kind of program to return proper objects that have their own code; and in this case, the user needs to trust that code (to an extent).
   
   On the other hand, if a user expects a program to simply return "plain old data", then it should not be possible for a program to return JavaScript that begins executing in their shell. One way we could establish this constraint is by designing the shell such that objects returned by programs cannot somehow begin executing on their own; the user has to deliberately execute them (e.g. invoke a method on an object).
   
   The lightweight version of this sandbox might be "if the user only interacts with program results as plain-old-data, then returned JavaScript has no chance to run". For this sandbox to work, though, it needs to be strong enough that a user can't invoke code unintentionally, such as with a property accessor, or array accessor, or any other way. A stronger version of this sandbox might be to require to allow-list a program before it may return JavaScript code into the user's shell environment. A non-allowed program simply can't do it, and JavaScript produced as output will be ignored or produce a warning.
    
   Additionally, we will likely want to run the JavaScript that *implements* the WebTerminal shell/REPL separately from the JavaScript running *within* the shell. (To clarify: a JavaScript REPL can be implemented with JavaScript, but that doesn't mean code run by the REPL has access to the REPL's internals; the same is true for WebTerminal.) The code that implements the REPL is ideally extensible, as with an extension system, perhaps, but does not need to be and should not be accessible to "regular" JavaScript code running within the shell.

Similar concerns also apply, to an extent, to other data that can be returned by programs, such as CSS. In general, I don't anticipate that most programs will return their own CSS for display in the WebTerminal. A primary goal of the design is to enable programs to produce and consume structured data, such that a separate presentation layer will render it into HTML, and such that it can be styled semantically (using styles that apply to each type of data, like file names, timestamps, etc.) However, to take advantage of the full power of the browser environment, there will inevitably be use-cases for programs to render content with their own styles. If we decide to sandbox program output by rendering it within an `iframe`, or another similar technique, then this will prevent one program's CSS from somehow manipulating the output of other programs.