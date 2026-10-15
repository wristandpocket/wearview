import * as THREE from 'three';

export interface WatchMaterials {
  /** Galaxy Watch5 Armor Aluminum, Graphite finish (bead-blasted, satin). */
  caseAluminum: THREE.MeshPhysicalMaterial;
  /** Pixel Watch polished stainless steel (Polished Silver). */
  caseStainlessSteel: THREE.MeshPhysicalMaterial;
  /** Rear sensor window: dark glossy glass/ceramic. */
  sensorGlass: THREE.MeshPhysicalMaterial;
  /** Black OLED border / inactive screen area under the cover glass. */
  bezelBlack: THREE.MeshPhysicalMaterial;
  /** Active display; screenshot texture goes in `map` (cloned per device). */
  displayEmpty: THREE.MeshBasicMaterial;
  /**
   * Cover glass. Rendered additively with a black base colour so it only ADDS
   * environment reflections (Fresnel-weighted) on top of the screen and never dims it.
   */
  coverGlass: THREE.MeshPhysicalMaterial;
  crownSteel: THREE.MeshPhysicalMaterial;
  strapSilicone: THREE.MeshPhysicalMaterial;
  wristSkin: THREE.MeshPhysicalMaterial;
}

export function createWatchMaterials(): WatchMaterials {
  const caseAluminum = new THREE.MeshPhysicalMaterial({
    color: 0x3b3e44,
    metalness: 1.0,
    roughness: 0.38,
  });

  const caseStainlessSteel = new THREE.MeshPhysicalMaterial({
    color: 0xd6d8dc,
    metalness: 1.0,
    roughness: 0.12,
  });

  const sensorGlass = new THREE.MeshPhysicalMaterial({
    color: 0x0c0d10,
    metalness: 0.0,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  });

  const bezelBlack = new THREE.MeshPhysicalMaterial({
    color: 0x010101,
    metalness: 0.0,
    roughness: 0.3,
    specularIntensity: 0.5,
  });

  const displayEmpty = new THREE.MeshBasicMaterial({
    color: 0x050608,
    toneMapped: false,
  });

  const coverGlass = new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    metalness: 0.0,
    roughness: 0.04,
    ior: 1.6,
    specularIntensity: 1.0,
    envMapIntensity: 1.0,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const crownSteel = new THREE.MeshPhysicalMaterial({
    color: 0xcfd2d6,
    metalness: 1.0,
    roughness: 0.22,
  });

  const strapSilicone = new THREE.MeshPhysicalMaterial({
    color: 0x26282c,
    metalness: 0.0,
    roughness: 0.62,
    sheen: 0.4,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color(0x60646c),
    side: THREE.DoubleSide,
  });

  const wristSkin = new THREE.MeshPhysicalMaterial({
    color: 0xc9a58a,
    metalness: 0.0,
    roughness: 0.68,
    sheen: 0.35,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color(0xffd9c2),
  });

  return {
    caseAluminum,
    caseStainlessSteel,
    sensorGlass,
    bezelBlack,
    displayEmpty,
    coverGlass,
    crownSteel,
    strapSilicone,
    wristSkin,
  };
}
