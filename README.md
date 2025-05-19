# barechat-web

Anonymous chat anywhere with localhost web interface

It based on [barechat](https://github.com/gasolin/barechat) and provide a local web chat UI instead of terminal.

## Features

- Instant chat with localhost web UI
- Fully p2p as barechaat, no server required.

## Prerequisite

Need bare runtime installed through npm. Could install globally using:

`npm i -g bare`

## Installation

```bash
npm install barechat-web
```

Or clone this repository and run:

```bash
npm install
```

## Normal Usage with commandline

Could install with command `npm i -g barechat-web` or run directly with `npx barechat-web`.

To test this chat app, in one terminal run:

```sh
> npx barechat
barechat v.1.1.0
BareChat Web server started on port [port]
Open your browser and navigate to http://localhost:[port]
...
```

In another terminal use the hashcode received from the first terminal's output:

```sh
> npx barechat-web a1b2c35fbeb452bc900c5a1c00306e52319a3159317312f54fe5a246d634f51a
BareChat Web server started on port [port]
Open your browser and navigate to http://localhost:[port]
[info] Attempting to join room with hashcode: a1b2c35fbeb452bc900c5a1c00306e52319a3159317312f54fe5a246d634f51a
...
[info] Successfully joined room: a1b2c35fbeb452bc900c5a1c00306e52319a3159317312f54fe5a246d634f51a
```

By anouncing the hashcode somewhere you can chat anonymously.

> And its fully compatible to chat with [barechat](https://github.com/gasolin/barechat)

## Clone and Setup

Clone the repository or download it and navigate to the directory, then run:

```sh
npm install
```

Start the server by running:

```bash
npm start
```

## Reference

- [barechat](https://github.com/gasolin/barechat)
- [RPGUI](https://github.com/RonenNess/RPGUI#rpgui)

## License

MIT
