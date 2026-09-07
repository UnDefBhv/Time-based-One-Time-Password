# TOTP Generator

A simple and lightweight TOTP generator built with Node.js, HTML, CSS, and vanilla JavaScript.

## Features

* Generate 6-digit TOTP codes
* 30-second code interval
* Base32 secret support
* HMAC-SHA1 based generation
* Real-time countdown
* Simple and responsive interface
* No external frontend libraries
* Uses Node.js native modules
* No Express or backend frameworks

## Requirements

* Node.js 18 or newer

## Usage

Clone the repository:

```bash
git clone https://github.com/UnDefBhv/time-based-one-time-password
cd totp
```

Start the server:

```bash
node server.js
```

Or use the npm script:

```bash
npm start
```

Open the application in your browser:

```text
http://localhost:3000
```

Enter a Base32 secret and click `Generate code`.

## Technologies

* HTML
* CSS
* JavaScript
* Node.js
* Node.js `http`
* Node.js `crypto`

## Security

The project uses HMAC-SHA1 and time-based counters to generate temporary authentication codes.

The Base32 secret is processed locally by the application and is not stored by the project.

## License

Licensed under the Apache License 2.0.
