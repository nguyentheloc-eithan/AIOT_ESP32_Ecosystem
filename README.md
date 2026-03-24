# AIOT ESP32 Ecosystem

**Project Codename:** AIOT_ESP32_Ecosystem  
**Version:** 1.0 — Full Vision  
**Last Updated:** March 24, 2026  
**Author:** Eithan Nguyen The Loc

---

## Quick Start

```bash
# 1. Start infrastructure (MQTT + PocketBase)
cd core/infra/docker
docker-compose up -d

# 2. Start backend
cd core/backend
go run main.go

# 3. Start frontend
cd core/frontend
npm install && npm run dev
```

**Documentation:** See [Getting Started Guide](docs/getting-started.md) for detailed setup.

**Technologies:**

- **Database:** PocketBase (embedded SQLite with REST API)
- **Frontend:** React + Vite (Progressive Web App)
- **Backend:** Go + Echo framework
- **Messaging:** MQTT (Eclipse Mosquitto)
- **Hardware:** M5Stack (ESP32-based)

---

## 1. Executive Summary

AIOT ESP32 Ecosystem is an open, modular IoT platform designed for agricultural and smart environment use cases. Built on the M5Stack hardware ecosystem, it gives farmers, hobbyists, and developers a plug-and-play foundation: a shared core infrastructure (connectivity, authentication, data pipeline, and web interface) that any sensor or actuator module can attach to without custom integration work.

Rather than building one product, this project builds a **platform** — one where new modules can be developed, published, and adopted by the community over time.

---

## 2. The Problem

Current IoT solutions for agriculture and home automation suffer from three core issues:

- **Fragmentation** — each device requires its own app, account, and configuration.
- **Rigidity** — systems are closed; adding a new sensor type means replacing the entire setup.
- **Complexity** — most platforms assume a software background, locking out farmers and non-technical users.

The AIOT ESP32 Ecosystem solves all three by providing a unified core that any module can connect to, with a single interface the user already knows.

---

## 3. Vision

> Build a modular, extensible IoT ecosystem where the core infrastructure is built once, and any device — pump, sensor, plug, or beyond — simply plugs in.

The end state is a platform where:

- A farmer can add a new soil sensor and have it appear in their dashboard within minutes.
- A developer can build and publish a new module (e.g. a CO₂ sensor) that any AIOT user can adopt.
- The system grows with its users — from a single garden to a multi-zone farm — without re-architecting.

---

## 4. Core Architecture

The ecosystem is structured around a **shared core** and **independent modules**. The core handles everything common; modules handle only what is unique to their function.

```
┌─────────────────────────────────────────────────────────────┐
│                        AIOT Core                            │
│                                                             │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────┐  │
│   │  MQTT    │   │ Backend  │   │ Database │   │  PWA   │  │
│   │  Broker  │◄──│ (Go)     │──►│(Postgres)│   │(React) │  │
│   └────▲─────┘   └──────────┘   └──────────┘   └────────┘  │
│        │                                                    │
└────────┼────────────────────────────────────────────────────┘
         │ MQTT Pub/Sub
┌────────┴────────────────────────────────────────────────────┐
│                     Module Layer                            │
│                                                             │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────┐ │
│   │   Smart    │  │   Smart    │  │   Smart    │  │  +   │ │
│   │  Pumping   │  │  Sensing   │  │   Plugs    │  │ More │ │
│   └────────────┘  └────────────┘  └────────────┘  └──────┘ │
└─────────────────────────────────────────────────────────────┘
         │
┌────────┴────────────────────────────────────────────────────┐
│                   Hardware Layer (M5Stack)                  │
│                                                             │
│        M5Stack Core2 / AtomS3 / StickC / Grove Units        │
└─────────────────────────────────────────────────────────────┘
```

**Core Components:**

| Layer         | Technology               | Responsibility                                         |
| ------------- | ------------------------ | ------------------------------------------------------ |
| Hardware      | M5Stack (ESP32-based)    | Sensor reading, actuator control, local display        |
| Messaging     | MQTT (Mosquitto)         | Real-time pub/sub between devices and backend          |
| Backend       | Golang (Echo framework)  | Business logic, scheduling, notifications, API         |
| Database      | PocketBase               | Persistent storage for all modules (SQLite + REST API) |
| Frontend      | React PWA (Vite)         | Unified dashboard, control interface, mobile support   |
| Notifications | Firebase Cloud Messaging | Push alerts to mobile devices (future)                 |

---

## 5. Modules

### 5.1 Smart Pumping

Automated water pump management with scheduling, manual override, and water consumption tracking.

**Key Capabilities:**

- Define recurring watering schedules (time + duration per session)
- Manual on/off control from the web app, synced in real time to the device
- Track cumulative water consumption per session and over time
- Dry-soil alerts: push notification when moisture is critically low and no schedule is active

**Hardware:** M5Stack Core2 + Relay Unit + Solenoid Valve (12V) + Switching Power Supply

---

### 5.2 Smart Sensing

A passive data-collection module that reads environmental conditions and feeds them into the shared data pipeline.

**Key Capabilities:**

- Continuous monitoring of soil moisture, temperature, humidity, and other Grove-compatible sensors
- Time-series data stored for historical trend analysis
- Threshold-based alerts configurable per sensor per user
- Data visible across all modules that depend on environmental state (e.g. Smart Pumping uses moisture readings)

**Hardware:** M5Stack Core2 / AtomS3 + Earth Unit + ENV Unit + any Grove sensor

---

### 5.3 Smart Plugs

Remote-controlled power outlets with automation rules and energy consumption monitoring.

**Key Capabilities:**

- Remote on/off via web app or scheduled automation
- Real-time energy consumption tracking (kWh per device)
- Automation rules: trigger on time, sensor value, or manual input
- Usage history and cost estimation per plug

**Hardware:** M5Stack Core2 + Relay Unit + Current Sensor (e.g. ACS712)

---

### 5.4 Future Modules _(Planned)_

The ecosystem is designed to grow. Potential future modules include:

| Module                | Description                                                           |
| --------------------- | --------------------------------------------------------------------- |
| **Smart Lighting**    | Automated grow lights with schedule and lux-based control             |
| **Smart Ventilation** | Fan/vent control based on temperature and humidity thresholds         |
| **Smart Feeding**     | Automated nutrient dosing for hydroponic systems                      |
| **Weather Station**   | Local micro-weather data (wind, rain, UV) feeding the shared pipeline |
| **Camera Module**     | Visual monitoring with time-lapse capture                             |

Any module that communicates over MQTT and follows the ecosystem's data schema can be integrated with zero changes to the core.

---

## 6. Design Principles

**1. Plug-and-play extensibility**
New hardware can be added by flashing firmware and connecting to the MQTT broker. No core code changes required.

**2. Single source of truth**
All state — device status, sensor readings, schedules, consumption logs — lives in one database. Every interface reads from the same data.

**3. Offline resilience**
M5Stack devices operate autonomously when internet connectivity is lost. Schedules cached on-device continue to execute; data is queued and synced when connection is restored.

**4. Open by default**
The platform is designed for the open source community. Module specifications, firmware templates, and API schemas are public so developers can build compatible modules independently.

**5. User-first interface**
The web app is designed for non-technical users (farmers, home gardeners). Controls are large, clear, and require no configuration knowledge to operate.

---

## 7. Hardware Ecosystem — M5Stack

All hardware in this project is built on the M5Stack product line, which provides:

- **ESP32-based controllers** with built-in Wi-Fi and Bluetooth
- **Grove connector system** for tool-free sensor/actuator attachment
- **Standardised form factors** for consistent enclosure design
- **Active community** with open firmware support (UIFlow, Arduino, MicroPython)

This choice ensures that users can source, replace, and expand hardware through a single vendor ecosystem with consistent physical and electrical interfaces.

---

## 8. Data Model Overview

All modules share a common data layer. Each module extends the base schema with its own tables.

**Core Tables (shared across all modules):**

| Table        | Purpose                                        |
| ------------ | ---------------------------------------------- |
| `devices`    | Registry of all connected M5Stack units        |
| `users`      | User accounts and notification preferences     |
| `alerts`     | Configurable threshold rules per device/sensor |
| `alert_logs` | History of triggered alerts and actions taken  |

**Per-Module Tables (examples):**

| Table                | Module        | Purpose                               |
| -------------------- | ------------- | ------------------------------------- |
| `sensor_logs`        | Smart Sensing | Time-series environmental readings    |
| `watering_schedules` | Smart Pumping | Recurring schedule definitions        |
| `watering_logs`      | Smart Pumping | Session history and water consumption |
| `plug_states`        | Smart Plugs   | Current on/off state per plug         |
| `energy_logs`        | Smart Plugs   | Power consumption time-series         |

---

## 9. Roadmap

### Stage 1 — Foundation _(Current)_

Establish the core platform and deliver the first two modules.

| Milestone           | Deliverable                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| Core infrastructure | MQTT broker, Go backend, PostgreSQL schema, React PWA shell                         |
| Smart Sensing (v1)  | Soil moisture + temperature readings, live dashboard, threshold alerts              |
| Smart Pumping (v1)  | Schedule management, manual control, push notifications, water consumption tracking |
| Hardware packaging  | All-in-one waterproof enclosure, plug-and-play installation                         |

### Stage 2 — Expansion

| Milestone            | Deliverable                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| Smart Plugs (v1)     | Remote control, energy monitoring, basic automation rules                   |
| Multi-device support | Manage multiple M5Stack units from a single dashboard                       |
| Module SDK           | Published firmware template and API spec for third-party module development |

### Stage 3 — Platform

| Milestone                 | Deliverable                                                                    |
| ------------------------- | ------------------------------------------------------------------------------ |
| Community module registry | Developers can publish and share compatible modules                            |
| Advanced automation       | Cross-module rules (e.g. "if moisture < 20% AND plug #2 is ON, activate pump") |
| Analytics dashboard       | Historical trends, consumption reports, predictive insights                    |
| Mobile app (native)       | iOS/Android companion app alongside the PWA                                    |

---

## 10. Target Users

| User Type              | Profile                       | Primary Use Case                                                |
| ---------------------- | ----------------------------- | --------------------------------------------------------------- |
| **Home Gardener**      | Non-technical, mobile-first   | Automate a small home garden, get alerts when plants need water |
| **Small-scale Farmer** | Practical, cost-conscious     | Monitor soil conditions across a plot, reduce water waste       |
| **IoT Developer**      | Technical, community-oriented | Build and publish new modules on top of the ecosystem           |
| **AgTech Enthusiast**  | Research-oriented             | Collect environmental data, experiment with automation rules    |

---

## 11. Open Source Strategy

The AIOT ESP32 Ecosystem is developed as an open source project with the following components made publicly available:

- **Firmware templates** for each M5Stack device type
- **Backend API specification** (OpenAPI / Swagger)
- **Module development guide** — how to build a compatible module
- **Hardware schematics** for reference enclosure designs

The goal is to build a community of contributors who extend the ecosystem with new modules, improving the platform for all users.

---

## 12. Repository Structure

```
AIOT_ESP32_Ecosystem/
├── README.md                       # This file - project overview
│
├── core/                           # Core platform infrastructure
│   ├── backend/                    # Go backend (Echo framework)
│   │   ├── main.go                 # Application entry point
│   │   ├── go.mod                  # Go dependencies
│   │   ├── config/                 # Configuration management
│   │   └── internal/               # Internal packages
│   │       ├── api/                # REST API handlers
│   │       ├── mqtt/               # MQTT client
│   │       ├── pb/                 # PocketBase client
│   │       ├── models/             # Data models
│   │       ├── services/           # Business logic
│   │       └── worker/             # Background workers
│   │
│   ├── frontend/                   # React PWA
│   │   ├── src/                    # Source code
│   │   ├── public/                 # Static assets
│   │   ├── package.json            # Dependencies
│   │   └── vite.config.ts          # Build configuration
│   │
│   └── infra/                      # Infrastructure configuration
│       ├── docker/                 # Docker Compose setup
│       │   └── docker-compose.yml  # Services definition
│       ├── mqtt/                   # MQTT broker config
│       │   └── mosquitto.conf      # Mosquitto configuration
│       ├── pocketbase/             # PocketBase database
│       │   ├── pb_data/            # Database files
│       │   └── pb_migrations/      # Schema migrations
│       └── migrations/             # Additional migrations
│
├── modules/                        # IoT modules (plug-and-play)
│   ├── smart-pumping/              # Automated watering system
│   │   ├── README.md               # Module documentation
│   │   ├── firmware/               # M5Stack firmware
│   │   ├── backend/                # Module-specific backend (if needed)
│   │   └── schema/                 # Database schema
│   │
│   ├── smart-sensing/              # Environmental monitoring
│   │   ├── README.md
│   │   ├── firmware/
│   │   └── ...
│   │
│   ├── smart-plugs/                # Remote power control
│   │   ├── README.md
│   │   ├── firmware/
│   │   └── ...
│   │
│   └── _template/                  # Starter template for new modules
│       └── README.md               # Module development guide
│
├── hardware/                       # Hardware documentation
│   ├── README.md                   # Hardware overview
│   ├── schematics/                 # Wiring diagrams per module
│   │   ├── smart-pumping/
│   │   ├── smart-sensing/
│   │   ├── smart-plugs/
│   │   └── common/                 # Shared components
│   │
│   └── enclosures/                 # 3D print files / assembly guides
│       ├── smart-pumping/
│       ├── smart-sensing/
│       ├── smart-plugs/
│       └── universal/              # Generic enclosures
│
└── docs/                           # Documentation
    ├── architecture.md             # System architecture
    ├── api-reference.md            # REST API documentation
    ├── getting-started.md          # Quick start guide
    └── projects-story/             # Project evolution
        ├── v1.0.0.md               # Stage 1 vision (irrigation)
        └── v1.0.1.md               # Future stages
```

---

_AIOT ESP32 Ecosystem — Build the core once. Plug in everything else._
