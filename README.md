# GLB to USDZ Converter

A simple, fast, and secure web-based tool to convert 3D models from GLB/GLTF format to USDZ. Built with React and Three.js, this tool performs the conversion entirely in your browser—no server required.

## Features

- **Local Conversion**: Your models never leave your computer. Privacy and speed are guaranteed.
- **Scene Optimization**: Automatically centers models and normalizes scale for the best AR experience.
- **Material Compatibility**: Automatically converts materials to `MeshStandardMaterial` for full USDZ support.
- **AR Ready**: Generates `quickLookCompatible` USDZ files, ready for iOS AR Quick Look and Apple Vision Pro.
- **Modern UI**: Clean, responsive interface built with Framer Motion and Lucide icons.

## Tech Stack

- **React**: Frontend framework.
- **Vite**: Fast build tool and dev server.
- **Three.js**: 3D engine and USDZExporter.

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/glb-to-usdz-converter.git
   cd glb-to-usdz-converter
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Usage

1. Open the tool in your browser.
2. Click the upload zone to select a `.glb` or `.gltf` file.
3. Wait for the conversion process to complete.
4. Download the generated `.usdz` file.
5. (Optional) Open the link on an iOS device to view the model in Augmented Reality.

## Credits

Based on the workflow described in the Three.js `USDZExporter` documentation and official examples.

## License

MIT
