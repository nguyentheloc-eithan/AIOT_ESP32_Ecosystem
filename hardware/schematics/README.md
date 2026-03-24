# Schematics

Wiring diagrams and circuit schematics for all AIOT ESP32 modules.

## Directory Structure

```
schematics/
├── smart-pumping/
│   ├── README.md
│   ├── wiring-diagram.png
│   └── schematic.pdf
├── smart-sensing/
│   ├── README.md
│   ├── wiring-diagram.png
│   └── schematic.pdf
├── smart-plugs/
│   ├── README.md
│   ├── wiring-diagram.png
│   └── schematic.pdf
└── common/
    ├── power-supply.pdf
    └── step-down-converter.pdf
```

## File Formats

- **PNG/JPG:** Wiring diagrams (visual, easy to view)
- **PDF:** Complete schematics (print quality)
- **Fritzing (.fzz):** Editable Fritzing files
- **KiCad (.kicad\_\*):** Professional schematics (if applicable)

## Naming Convention

Use descriptive, lowercase names with hyphens:

- `module-name-wiring-v1.png`
- `module-name-schematic-v1.pdf`
- `power-distribution.pdf`

## Standards

All schematics should include:

- [ ] Title block with version date
- [ ] Complete component list
- [ ] Wire colors and gauges
- [ ] Power supply specifications
- [ ] Safety warnings
- [ ] Pin assignments for M5Stack
- [ ] Connector types

## Contributing

When adding schematics:

1. Create module subdirectory
2. Add README with component list
3. Include both visual and detailed views
4. Test wiring before publishing
5. Include photos of working build
