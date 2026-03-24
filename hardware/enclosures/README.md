# Enclosures

3D models, assembly guides, and mounting instructions for AIOT ESP32 modules.

## Directory Structure

```
enclosures/
├── smart-pumping/
│   ├── README.md
│   ├── enclosure-v1.stl
│   ├── lid-v1.stl
│   └── assembly-guide.pdf
├── smart-sensing/
│   ├── README.md
│   ├── enclosure-v1.stl
│   └── assembly-guide.pdf
├── smart-plugs/
│   ├── README.md
│   ├── enclosure-v1.stl
│   └── assembly-guide.pdf (with safety warnings)
└── universal/
    ├── m5stack-core2-case.stl
    └── weatherproof-box.stl
```

## File Formats

- **STL:** 3D printable models
- **STEP/IGES:** CAD files for modification
- **PDF:** Assembly instructions
- **DXF:** Laser cutting files (if applicable)

## 3D Printing Guidelines

### Recommended Settings

```
Material: PETG or ABS (outdoor), PLA (indoor)
Layer Height: 0.2mm
Infill: 20-30%
Wall Thickness: 3-4 perimeters
Supports: As needed
```

### Materials

- **PLA:** Easy to print, indoor only, not heat resistant
- **PETG:** Good strength, weather resistant, recommended
- **ABS:** Strong, heat resistant, requires heated bed
- **ASA:** Like ABS but UV resistant (outdoor)
- **TPU:** Flexible (gaskets, seals)

### Post-Processing

**For outdoor use:**

1. Sand smooth (start 120 grit, finish 400)
2. Seal with epoxy coating or XTC-3D
3. Paint with UV-resistant paint
4. Add weatherproof gaskets

## IP Ratings

Target IP ratings for enclosures:

- **Indoor modules:** IP20+ (basic dust protection)
- **Outdoor electronics:** IP65 (dust tight, water jets)
- **Outdoor sensors:** IP67-68 (temporary/continuous submersion)

## Design Requirements

### Cable Entry

- Use cable glands (PG7, PG9 size typically)
- Multiple entries for power + sensors
- Strain relief for cables
- Sealed when not in use

### Ventilation

- Passive vents for heat dissipation
- Mesh to prevent insect entry
- Gore-Tex vents for pressure equalization
- No vents for waterproof enclosures

### Mounting

- Wall mount screw holes (standard spacing)
- DIN rail clips (optional)
- Pole/pipe mounting
- Ground stake for outdoor sensors

### Access

- Tool-free lid removal (clips or magnets)
- Or secure screws for outdoor use
- Sufficient space for hand access
- Component mounting bosses inside

## Assembly Notes

### Inserts

Use threaded inserts for:

- Lid attachment screws
- Component mounting points
- Wall mounting brackets

**Installation:**

- M3 heat-set inserts (most common)
- Use soldering iron at 200-250°C
- Press straight and hold until cooled

### Sealing

For weatherproof enclosures:

- Rubber gasket on lid
- Silicone sealant around cable entries
- O-rings on removable panels
- Test seal before outdoor deployment

### Component Mounting

- PCB standoffs (M3 × 6mm typical)
- Cable ties for wire management
- Foam tape for vibration damping
- Hot glue for securing light components

## Customization

### Parametric Design

If possible, provide parametric models:

- Fusion 360 (.f3d)
- FreeCAD (.FCStd)
- OpenSCAD (.scad)

This allows users to adjust:

- Enclosure size (more/fewer components)
- Mounting hole spacing
- Display cutout size
- Cable entry positions

### Modular Design

Consider making enclosures modular:

- Stackable sections
- Interchangeable lids
- Standard mounting rails inside
- Snap-together assembly

## Testing

Before publishing enclosure design:

- [ ] Test print completed successfully
- [ ] Components fit with reasonable tolerances
- [ ] Lid closes securely
- [ ] Cables route cleanly
- [ ] Mounting method tested
- [ ] IP rating tested (water test for outdoor)
- [ ] Labels/indicators visible
- [ ] User can access all necessary points

## Safety Considerations

### AC-Rated Enclosures (Smart Plugs)

**Critical requirements:**

- UL/CE rated enclosure for mains voltage
- Minimum 3mm clearance from live parts
- Proper grounding
- Flame-retardant material
- Tamper-evident or secured
- Clear high-voltage warnings

⚠️ **Do not use 3D printed enclosures for mains voltage unless properly rated and certified**

## Contributing

When adding enclosure designs:

1. Create module subfolder
2. Include all source files (STL + editable)
3. Provide assembly instructions
4. List required hardware (screws, inserts, etc.)
5. Show photos of assembled enclosure
6. Document any special printing settings
7. Note estimated print time and material usage

## Resources

### Design Tools

- **Fusion 360:** Free for hobbyists
- **FreeCAD:** Open source
- **OpenSCAD:** Parametric, code-based
- **Tinkercad:** Beginner-friendly, web-based

### Communities

- **Thingiverse:** Share and download designs
- **Printables:** Prusa's sharing platform
- **GrabCAD:** Engineering community

### Standards

- **NEMA Ratings:** Enclosure protection standards (US)
- **IP Codes:** International protection ratings
- **UL 508A:** Industrial control panels

---

**Design smart. Print strong. Build safe. 📦**
