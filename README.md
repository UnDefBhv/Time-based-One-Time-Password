# TOTP Generator

A simple and lightweight TOTP generator built with Node.js, HTML, CSS, and vanilla JavaScript.

## Overview

TOTP Generator creates Time-based One-Time Passwords from a Base32 secret.

TOTP codes are temporary 6-digit authentication codes that change every 30 seconds.

The project uses Node.js native modules and does not require Express or other backend frameworks.

## Features

- Generate 6-digit TOTP codes
- 30-second code interval
- Base32 secret support
- HMAC-SHA1 based generation
- Real-time countdown
- Simple and responsive interface
- No external frontend libraries
- Node.js native `http` server

## Technologies

- HTML
- CSS
- JavaScript
- Node.js
- Node.js `http`
- Node.js `crypto`
