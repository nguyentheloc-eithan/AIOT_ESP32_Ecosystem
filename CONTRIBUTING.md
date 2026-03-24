# Contributing to AIOT ESP32 Ecosystem

Thank you for your interest in contributing! This project welcomes contributions from developers, makers, and IoT enthusiasts.

## Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features or modules
- 📝 Improve documentation
- 🔧 Submit bug fixes
- ✨ Add new modules
- 🎨 Improve UI/UX
- 🧪 Write tests
- 🌐 Translate documentation

## Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/aiot-esp32-ecosystem.git
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/my-new-feature
   ```
4. **Make your changes**
5. **Test thoroughly**
6. **Commit with clear messages:**
   ```bash
   git commit -m "feat: add new moisture sensor support"
   ```
7. **Push to your fork:**
   ```bash
   git push origin feature/my-new-feature
   ```
8. **Open a Pull Request**

## Development Setup

See [Getting Started Guide](docs/getting-started.md) for complete setup instructions.

**Quick setup:**

```bash
# Infrastructure
cd core/infra/docker && docker-compose up -d

# Backend
cd core/backend && go run main.go

# Frontend
cd core/frontend && npm install && npm run dev
```

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**

```
feat(pumping): add flow meter support
fix(mqtt): reconnect on connection loss
docs(api): update endpoint documentation
refactor(backend): improve error handling
```

## Code Style

### Golang

- Follow [Effective Go](https://golang.org/doc/effective_go.html)
- Use `gofmt` for formatting
- Run `golint` before committing
- Comment exported functions

### TypeScript/React

- Use TypeScript strict mode
- Follow React best practices
- Use functional components with hooks
- Comment complex logic

### Arduino/C++

- Follow [Arduino Style Guide](https://www.arduino.cc/en/Reference/StyleGuide)
- Use meaningful variable names
- Add file headers with description
- Comment hardware-specific code

## Adding a New Module

1. **Copy the template:**

   ```bash
   cp -r modules/_template modules/your-module-name
   ```

2. **Update module README** with:
   - Hardware requirements
   - Wiring diagram
   - Setup instructions
   - API endpoints
   - Sample code

3. **Create firmware** in `firmware/` directory

4. **Add backend handlers** (if needed) in `core/backend/internal/api/`

5. **Add database schema** (if needed) in PocketBase migrations

6. **Create wiring diagram** in `hardware/schematics/your-module-name/`

7. **Test thoroughly:**
   - Hardware functionality
   - MQTT communication
   - API endpoints
   - UI integration

8. **Submit PR** with:
   - Module description
   - Photos/videos of working hardware
   - Documentation

## Testing

### Backend Tests

```bash
cd core/backend
go test ./...
```

### Frontend Tests

```bash
cd core/frontend
npm test
```

### Integration Tests

- Manual testing checklist
- MQTT message flow verification
- End-to-end scenarios

## Documentation

All contributions should include appropriate documentation:

- **Code:** Inline comments for complex logic
- **API:** Update `docs/api-reference.md`
- **Modules:** Complete README in module directory
- **Architecture:** Update `docs/architecture.md` if needed

## Hardware Contributions

When contributing hardware designs:

1. **Include:**
   - Complete Bill of Materials (BOM)
   - Wiring diagrams (Fritzing, KiCad, or clear photos)
   - 3D models for enclosures (STL files)
   - Assembly instructions
   - Safety warnings

2. **Test:**
   - Build and test the hardware
   - Verify all connections
   - Document any gotchas

3. **Photos:**
   - Include clear photos of completed build
   - Show internal wiring
   - Demonstrate final installation

## Pull Request Process

1. **Ensure your PR:**
   - Has a clear title and description
   - References any related issues
   - Includes tests (if applicable)
   - Updates documentation
   - Follows code style guidelines

2. **PR will be reviewed for:**
   - Code quality
   - Functionality
   - Documentation
   - Test coverage
   - Breaking changes

3. **After approval:**
   - PR will be merged
   - You'll be added to contributors list
   - Changes will appear in changelog

## Reporting Bugs

**Before submitting a bug:**

- Check existing issues
- Verify it's reproducible
- Collect relevant information

**Include in bug report:**

- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, versions)
- Logs and error messages
- Screenshots (if applicable)

**Example:**

```markdown
## Bug: MQTT connection fails on startup

**Environment:**

- OS: Ubuntu 22.04
- Go version: 1.25
- MQTT broker: Mosquitto 2.0

**Steps to reproduce:**

1. Start MQTT broker
2. Run backend with `go run main.go`
3. See connection error in logs

**Expected:** Backend connects to MQTT
**Actual:** Connection timeout error

**Logs:**
```

❌ Failed to connect to MQTT broker: connection timeout

```

**Screenshots:** [attach if relevant]
```

## Suggesting Features

**Feature requests should include:**

- Clear description of the problem
- Proposed solution
- Why it benefits the project
- Any alternative approaches considered

**Label appropriately:**

- `enhancement` - New features
- `module` - New module ideas
- `documentation` - Documentation improvements

## Community Guidelines

- Be respectful and inclusive
- Help others learn
- Give constructive feedback
- Credit original authors

## Questions?

- Check [Getting Started Guide](docs/getting-started.md)
- Read [Architecture Documentation](docs/architecture.md)
- Search existing issues
- Ask in GitHub Discussions
- Join Discord (link coming soon)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

**Thank you for contributing to AIOT ESP32 Ecosystem! 🌟**
