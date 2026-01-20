# Precision Tape Measure Visualizer

![Precision Tape App Hero](https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2670&auto=format&fit=crop)

A professional-grade tool designed for CAD designers, carpenters, and engineers to instantly convert decimal inch measurements into precise fractional tape measure readings.

## Features

### 🎯 High-Precision Conversion
- **Variable Precision**: Toggle between **1/16"**, **1/32"**, and **1/64"** accuracy modes to match your specific workflow needs.
- **Smart Math Input**: The input field acts as a command line. Type expressions like `5 + 3/8` or `12.5 / 2` and get immediate, evaluated results.
- **Error Analysis**: Instantly see the difference ("delta") between your decimal input and the nearest available fraction on the tape (e.g., `Diff: +0.0025"`).

### 📏 Interactive Visualization
- **Realistic Tape Rendering**: A D3.js-powered, vector-based tape measure that dynamically scales and scrolls to your exact measurement.
- **Visual Landmarks**: Distinct rendering for whole inches, halves, quarters, eighths, and sixteenths helps you visualize the measurement spatially.
- **Dynamic Zoom**: The tape measure automatically adjusts its density based on your screen size and selected precision level.

### ⌨️ Productivity Controls
- **Keyboard Nudging**: Focus the input and use `UP` / `DOWN` arrow keys to increment or decrement the measurement by your selected precision step (e.g., nudge by exactly 1/64").
- **History Log**: Automatically logs your valid measurements. Click any history item to reload it into the visualizer.
- **Clipboard Integration**: One-click copy for the formatted fractional result (e.g., `5 3/8"`).

### 🛠️ Utility Tools
- **Common Conversions**: Quick-access buttons for standard fraction-to-decimal conversions (1/8, 1/4, 1/2, etc.) with visual percentage bars.
- **Dark Mode UI**: A high-contrast, industrial aesthetic using the **JetBrains Mono** typeface, optimized for technical environments.

## Tech Stack
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: D3.js
- **Icons**: Lucide React
