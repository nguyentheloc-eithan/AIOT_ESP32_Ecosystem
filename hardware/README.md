# Hardware Documentation

This directory contains hardware schematics, wiring diagrams, enclosure designs, and assembly guides for all AIOT ESP32 Ecosystem modules.

## Directory Structure

```
hardware/
├── schematics/              # Wiring diagrams and circuit schematics
│   ├── smart-pumping/
│   ├── smart-sensing/
│   ├── smart-plugs/
│   └── common/             # Shared components (power supplies, etc.)
└── enclosures/              # 3D models and assembly guides
    ├── smart-pumping/
    ├── smart-sensing/
    ├── smart-plugs/
    └── universal/          # Generic M5Stack enclosures
```

## M5Stack Ecosystem

All modules are built on the M5Stack product line:

### Controllers

| Model              | Features                                | Best For                      |
| ------------------ | --------------------------------------- | ----------------------------- |
| **M5Stack Core2**  | 320×240 touch screen, IMU, speaker, RTC | Full-featured modules with UI |
| **M5Stack CoreS3** | Similar to Core2, newer ESP32-S3        | Latest projects               |
| **M5Stack AtomS3** | Compact, 0.85" screen                   | Space-constrained deployments |
| **M5StickC Plus**  | Battery-powered, small display          | Portable sensing              |

### Connectivity

- **Wi-Fi:** Built into all ESP32 chips
- **Bluetooth:** Available but not used in base architecture
- **Grove Ports:** Tool-free sensor connections
- **GPIO Header:** For custom connections

### Power Supply

**USB-C (M5Stack Core2):**

- Input: 5V DC
- Power via USB-C port
- Use quality 2A+ USB adapter

**Battery Option:**

- M5Stack Bottom (with 18650 battery)
- ~2000mAh typical
- Hours to days depending on module

**External DC (for actuators):**

- 12V DC switching supply
- Use step-down converter for M5Stack (12V → 5V)
- Size appropriately for actuators (relay, pump, etc.)

## Common Components

### Sensors

| Component               | Interface  | Purpose                  | Modules          |
| ----------------------- | ---------- | ------------------------ | ---------------- |
| Earth Unit              | Analog/I2C | Soil moisture            | Pumping, Sensing |
| ENV Unit III            | I2C        | Temp, Humidity, Pressure | Sensing          |
| TVOC/eCO₂ Unit          | I2C        | Air quality              | Sensing          |
| Current Sensor (ACS712) | Analog     | Power monitoring         | Plugs            |

### Actuators

| Component      | Interface | Purpose               | Modules        |
| -------------- | --------- | --------------------- | -------------- |
| Relay Unit     | GPIO      | Switch devices on/off | Pumping, Plugs |
| Solenoid Valve | Relay     | Water flow control    | Pumping        |
| Mini Fan Unit  | PWM       | Ventilation           | (Future)       |

### Power & Protection

- Switching power supply (12V 5A)
- LM2596 step-down (12V → 5V)
- Fuses (appropriate rating)
- TVS diodes for protection
- Proper wire gauge for current

## Safety Guidelines

### Electrical Safety

**Low Voltage (5V, 12V DC):**

- Generally safe
- Still follow proper polarity
- Use fused power supplies

**Mains Voltage (110V, 220V AC):**

- ⚠️ **DANGEROUS - Can Kill**
- Only qualified electricians
- Follow all local codes
- Use proper enclosures
- Test with meter before touching
- GFCI/RCD protection required

### Environmental

**IP Ratings:**

- Indoor modules: IP20+ (basic protection)
- Outdoor modules: IP65+ (water resistant)
- Soil sensors: IP68 (fully submersible sensor part)

**Temperature Ranges:**

- M5Stack operating: 0°C to 40°C
- Storage: -20°C to 60°C
- Extended range: Special components required

## Wiring Best Practices

### Wire Gauge Selection

| Current | Gauge (AWG) | Metric (mm²) |
| ------- | ----------- | ------------ |
| < 1A    | 22-24       | 0.5          |
| 1-2A    | 20-22       | 0.75         |
| 2-5A    | 18-20       | 1.0          |
| 5-10A   | 16-18       | 1.5          |
| 10-15A  | 14-16       | 2.5          |

### Color Coding

**DC Circuits:**

- Red: Positive (+)
- Black: Negative (-)
- Other colors: Signal

**AC Circuits (varies by location):**

- US: Black/Red (hot), White (neutral), Green (ground)
- EU: Brown (hot), Blue (neutral), Green/Yellow (ground)

### Connections

- **Solder:** Best for permanent connections
- **Terminal blocks:** Good for field assembly
- **Dupont connectors:** Fine for low current, indoors
- **Crimped terminals:** Professional for high current

### Cable Management

- Bundle related wires together
- Label all connections
- Leave service slack
- Avoid sharp bends
- Secure to prevent strain
- Keep power away from signal wires

## Enclosure Design

### Requirements

**Protection:**

- Dust and water (IP rating)
- Physical impact
- UV exposure (outdoor)
- Temperature extremes

**Access:**

- Removable lid for maintenance
- Cable entry points (glands)
- Ventilation (if needed)

**Mounting:**

- Wall mount brackets
- Pole mount option
- Ground stake (outdoor sensors)

### Materials

- **ABS Plastic:** Good all-round, 3D printable
- **Polycarbonate:** Higher impact resistance
- **Aluminum:** Metal enclosures, better heat dissipation
- **PVC:** Outdoor electrical boxes

### 3D Printing

- **Material:** PETG or ABS (better than PLA for outdoors)
- **Infill:** 20-30% for strength
- **Layer height:** 0.2mm standard
- **Post-processing:** Sand, seal, paint for outdoor use

## Assembly Guidelines

### Tools Required

**Basic:**

- Screwdrivers (Phillips, flathead)
- Wire strippers
- Multimeter
- Soldering iron (if soldering)

**Recommended:**

- Crimp tool
- Heat gun (heat shrink)
- Drill (enclosure modifications)
- Label maker

### Assembly Steps

1. **Read documentation** completely first
2. **Test components** individually before assembly
3. **Follow wiring diagram** exactly
4. **Use proper wire gauge** for current
5. **Secure all connections** (solder or crimp)
6. **Insulate exposed connections** (heat shrink, tape)
7. **Mount components** securely in enclosure
8. **Label all wires** at both ends
9. **Test with multimeter** before power on
10. **Initial power-up** with current limiting (if possible)

### Testing Procedure

**Pre-power tests:**

- [ ] Visual inspection (no loose wires, proper polarity)
- [ ] Continuity test (connections are good)
- [ ] Isolation test (no shorts to ground)
- [ ] Resistance check (sensors reading correctly)

**Power-up tests:**

- [ ] Measure supply voltage (correct value)
- [ ] Check current draw (within expected range)
- [ ] Sensor readings (meaningful values)
- [ ] MQTT connectivity (messages flowing)
- [ ] Actuator control (relays clicking, etc.)

## Documentation Standards

When creating hardware documentation for a module:

### Schematic Requirements

**Include:**

- Complete component list with part numbers
- Clear connection labels
- Power supply specifications
- Pin assignments
- Optional components marked

**Tools:**

- Fritzing (beginners, visual)
- KiCad (advanced, professional)
- Eagle (industry standard)
- Draw.io (simple diagrams)

### Wiring Diagram Requirements

**Show:**

- Physical component layout
- Wire colors
- Connection points
- Power flow direction
- Safety warnings

**Format:**

- High resolution (300 DPI minimum)
- Multiple views if needed (top, side)
- Zoom details for complex areas
- Annotation callouts

### Photography

**Include photos of:**

- Finished assembly (multiple angles)
- Internal wiring (before closing)
- Critical connection points (closeups)
- Final installation location

**Photo tips:**

- Good lighting
- Clean background
- Include scale reference
- In-focus closeups

## Resources

### Component Suppliers

- **M5Stack Official:** https://shop.m5stack.com/
- **AliExpress:** Bulk components, sensors
- **Adafruit:** Quality components, good documentation
- **SparkFun:** Sensors and modules
- **Digi-Key:** Electronic components
- **Mouser:** Electronic components

### Learning Resources

- **M5Stack Documentation:** Official guides
- **Fritzing Projects:** Example schematics
- **Electronics Tutorials:** Learn basics
- **3D Printing:** Thingiverse, Printables

### Safety Standards

- **UL Listed:** US safety certification
- **CE Mark:** European conformity
- **IEC 61010:** Electrical equipment safety
- **NEMA Ratings:** Enclosure protection

## Contributing

When adding hardware documentation:

1. Create folder under appropriate module
2. Include complete schematic (editable format + PDF)
3. Add wiring diagram (clear, labeled)
4. Provide Bill of Materials (BOM)
5. Include assembly photos
6. Add troubleshooting section
7. Test with community before publishing

## Support

Hardware questions?

- Check module-specific docs first
- Post in hardware discussion forum
- Open issue with photos if problem persists

---

**Build safely. Test thoroughly. Document well. 🔧**
