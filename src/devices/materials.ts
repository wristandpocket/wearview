import * as THREE from 'three';

export interface WatchMaterials {
  caseAluminum: THREE.MeshStandardMaterial;
  caseStainlessSteel: THREE.MeshStandardMaterial;
  caseMatteBlack: THREE.MeshStandardMaterial;
  sensorCeramic: THREE.MeshStandardMaterial;
  bezelSubstrate: THREE.MeshStandardMaterial;
  bezelTexturedRing: THREE.MeshStandardMaterial;
  displayEmpty: THREE.MeshBasicMaterial;
  glassSapphire: THREE.MeshPhysicalMaterial;
  glassDomedPebble: THREE.MeshPhysicalMaterial;
  crownKnurled: THREE.MeshStandardMaterial;
  buttonAccent: THREE.MeshStandardMaterial;
  strapSilicone: THREE.MeshStandardMaterial;
  wristSkin: THREE.MeshStandardMaterial;
}

export function createWatchMaterials(): WatchMaterials {
  // Samsung Armor Aluminum (Graphite Black anodized finish matching real watch)
  const caseAluminum = new THREE.MeshStandardMaterial({
    color: 0x22262e,
    metalness: 0.85,
    roughness: 0.28
  });

  // Pixel Watch Polished Stainless Steel (Silver finish)
  const caseStainlessSteel = new THREE.MeshStandardMaterial({
    color: 0xdee2e6,
    metalness: 0.96,
    roughness: 0.14
  });

  // Matte Black Accent / Inset
  const caseMatteBlack = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    metalness: 0.5,
    roughness: 0.5
  });

  // Rear sensor housing (dark glossy ceramic/glass)
  const sensorCeramic = new THREE.MeshStandardMaterial({
    color: 0x111317,
    metalness: 0.3,
    roughness: 0.2
  });

  // Deep black OLED bezel substrate
  const bezelSubstrate = new THREE.MeshStandardMaterial({
    color: 0x050608,
    metalness: 0.1,
    roughness: 0.6
  });

  // Galaxy Watch touch bezel textured ring
  const bezelTexturedRing = new THREE.MeshStandardMaterial({
    color: 0x14161b,
    metalness: 0.4,
    roughness: 0.45
  });

  // Active display material (pure emissive display representation)
  // Active display material (pure emissive display representation)
  // When texture is applied, this displays exact RGB values without distortion
  const displayEmpty = new THREE.MeshBasicMaterial({
    color: 0x090b10,
    toneMapped: false
  });

  // Flat Sapphire glass for Galaxy Watch5 (crystal clear with refined specular clearcoat)
  const glassSapphire = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.06,
    roughness: 0.03,
    metalness: 0.0,
    ior: 1.77,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    depthWrite: false
  });

  // Domed Corning Gorilla Glass 5 for Pixel Watch (smooth curved glint, crystal clear)
  const glassDomedPebble = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.06,
    roughness: 0.03,
    metalness: 0.0,
    ior: 1.52,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    depthWrite: false
  });

  // Fluted/knurled crown
  const crownKnurled = new THREE.MeshStandardMaterial({
    color: 0xd4d8de,
    metalness: 0.92,
    roughness: 0.25
  });

  // Subtle button accent
  const buttonAccent = new THREE.MeshStandardMaterial({
    color: 0xe11d48, // Subtle red accent ring for GW5 power key
    metalness: 0.8,
    roughness: 0.3
  });

  // Dark charcoal silicone strap matching real Samsung sport band
  const strapSilicone = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    metalness: 0.04,
    roughness: 0.75
  });

  // Natural wrist skin tone matching real hardware on arm
  const wristSkin = new THREE.MeshStandardMaterial({
    color: 0xdeb897, // Warm natural arm tone
    metalness: 0.0,
    roughness: 0.72
  });

  return {
    caseAluminum,
    caseStainlessSteel,
    caseMatteBlack,
    sensorCeramic,
    bezelSubstrate,
    bezelTexturedRing,
    displayEmpty,
    glassSapphire,
    glassDomedPebble,
    crownKnurled,
    buttonAccent,
    strapSilicone,
    wristSkin
  };
}
