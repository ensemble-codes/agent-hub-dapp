# Contributing to Agent Hub

Thank you for your interest in contributing to Agent Hub! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/ensemble-codes/agent-hub-dapp/issues)
2. If not, create a new issue with:
   - A clear, descriptive title
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment (browser, OS, wallet)

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with the `enhancement` label
3. Describe the feature and its use case
4. Explain why it would be valuable

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Ensure the build passes:
   ```bash
   pnpm build
   ```
5. Run linting:
   ```bash
   pnpm lint
   ```
6. Commit your changes with a descriptive message
7. Push to your fork and submit a pull request

## Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/agent-hub-dapp.git
   cd agent-hub-dapp
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

## Code Style

- Follow existing code patterns
- Use TypeScript for type safety
- Use Tailwind CSS for styling
- Keep components small and focused
- Write meaningful commit messages

## Commit Messages

Use clear, descriptive commit messages:

- `feat: add agent search functionality`
- `fix: resolve wallet connection issue`
- `docs: update README with setup instructions`
- `refactor: simplify task creation flow`

## Questions?

Join our [Telegram](https://t.me/+V2yQK15ZYLw3YWU0) for questions and discussions.
