import { useState, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import './App.css';

function App() {
  const [status, setStatus] = useState('idle'); // idle, loading, processing, exporting, success, error
  const [error, setError] = useState(null);
  const [downloadInfo, setDownloadInfo] = useState(null);
  const fileInputRef = useRef(null);

  const prepareSceneForUSDZ = async (scene) => {
    scene.traverse((obj) => {
      if (!obj.isMesh) return;

      let materials = obj.material;
      if (!Array.isArray(materials)) materials = [materials];

      materials.forEach((mat, index) => {
        if (!(mat instanceof THREE.MeshStandardMaterial)) {
          const oldMat = mat;
          const newMat = new THREE.MeshStandardMaterial({
            color: oldMat.color || 0xffffff,
            map: oldMat.map,
            normalMap: oldMat.normalMap,
            roughnessMap: oldMat.roughnessMap,
            metalnessMap: oldMat.metalnessMap,
            emissiveMap: oldMat.emissiveMap,
            alphaMap: oldMat.alphaMap,
            transparent: !!oldMat.transparent,
            opacity: oldMat.opacity ?? 1,
            side: oldMat.side || THREE.FrontSide,
          });

          if (Array.isArray(obj.material)) {
            obj.material[index] = newMat;
          } else {
            obj.material = newMat;
          }
        }
      });

      // Fix ORM maps
      const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
      if (mat.metalnessMap) {
        mat.metalness = 1;
        if (!mat.roughnessMap) mat.roughnessMap = mat.metalnessMap;
      }
      if (mat.roughnessMap) mat.roughness = 1;
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setStatus('loading');
    setError(null);
    setDownloadInfo(null);

    try {
      const url = URL.createObjectURL(file);
      const loader = new GLTFLoader();
      
      loader.load(url, async (gltf) => {
        setStatus('processing');
        const scene = new THREE.Scene();
        const model = gltf.scene;
        scene.add(model);

        // Center and Normalize Scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        model.position.sub(center);

        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 2 || maxDim < 0.3) {
          const targetSize = maxDim > 2 ? 2 : 0.8;
          model.scale.setScalar(targetSize / maxDim);
        }

        setStatus('exporting');
        const usdzFileName = file.name.replace(/\.(glb|gltf)$/, '') + '.usdz';
        
        await prepareSceneForUSDZ(scene);
        const exporter = new USDZExporter();

        const arrayBuffer = await exporter.parseAsync(scene, {
          maxTextureSize: 1024,
          quickLookCompatible: true,
          onlyVisible: true,
          includeAnchoringProperties: true,
        });

        const blob = new Blob([arrayBuffer], { type: 'model/vnd.usdz+zip' });
        const downloadUrl = URL.createObjectURL(blob);
        
        setDownloadInfo({
          url: downloadUrl,
          fileName: usdzFileName
        });
        setStatus('success');
        URL.revokeObjectURL(url);
      }, undefined, (err) => {
        console.error(err);
        setError('Failed to load GLB file. Please check the file format.');
        setStatus('error');
      });
    } catch (err) {
      console.error(err);
      setError('An error occurred during the conversion process.');
      setStatus('error');
    }
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="app-container">
      <div className="converter-card">
        <header>
          <h1>GLB to USDZ</h1>
          <p>Convert 3D models to AR format for iOS</p>
        </header>

        <main>
          <div 
            className={`upload-zone ${status === 'loading' || status === 'processing' || status === 'exporting' ? 'disabled' : ''}`}
            onClick={status === 'idle' || status === 'success' || status === 'error' ? triggerUpload : undefined}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".glb,.gltf"
              hidden 
            />
            
            {status === 'idle' && (
              <div className="status-content">
                <p>Click to upload GLB or GLTF file</p>
                <span>Recommended max size: 50MB</span>
              </div>
            )}

            {(status === 'loading' || status === 'processing' || status === 'exporting') && (
              <div className="status-content">
                <p>
                  {status === 'loading' && 'Loading model...'}
                  {status === 'processing' && 'Preparing scene...'}
                  {status === 'exporting' && 'Exporting to USDZ...'}
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="status-content success">
                <p>Conversion complete!</p>
                <button className="reset-btn" onClick={(e) => {
                  e.stopPropagation();
                  setStatus('idle');
                  setDownloadInfo(null);
                }}>Convert another file</button>
              </div>
            )}

            {status === 'error' && (
              <div className="status-content error">
                <div className="icon-emoji">❌</div>
                <p>{error}</p>
                <button className="reset-btn" onClick={(e) => {
                  e.stopPropagation();
                  setStatus('idle');
                }}>Try again</button>
              </div>
            )}
          </div>

          {downloadInfo && (
            <div className="result-section">
              <div className="download-actions">
                <a href={downloadInfo.url} download={downloadInfo.fileName} className="action-button primary">
                  <span>📥</span> Download {downloadInfo.fileName}
                </a>
              </div>
            </div>
          )}
        </main>

        <footer>
          <p>Powered by Three.js USDZExporter Workflow</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
