/**
 * Smart Attendance — Silent Face Scanner
 *
 * How it works:
 *  1. Opens camera silently (no preview on screen)
 *  2. Captures a frame
 *  3. Detects face + extracts 128-float descriptor
 *  4. Closes camera immediately
 *  5. Returns the descriptor
 *
 * User sees: nothing (camera indicator light only — browser enforces this)
 * No photo is ever stored — only 128 numbers.
 */

import api from '../api/axios';

let modelsLoaded = false;

/** Load face-api models once — cached by Service Worker after first load */
async function loadModels() {
  if (modelsLoaded) return;
  const { nets } = await import('@vladmandic/face-api');
  const MODEL_URL = '/models';
  await Promise.all([
    nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

/**
 * Silently capture face descriptor from camera.
 * @returns {Promise<Float32Array|null>} 128-float descriptor or null if no face found
 */
export async function captureFaceDescriptor() {
  await loadModels();
  const { detectSingleFace, SsdMobilenetv1Options } = await import('@vladmandic/face-api');

  // Hidden video element — user never sees the feed
  const video = document.createElement('video');
  video.style.cssText = 'position:fixed;opacity:0;pointer-events:none;width:320px;height:240px;top:-9999px';
  document.body.appendChild(video);

  let stream = null;
  try {
    // Open camera
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 320, height: 240 },
    });
    video.srcObject = stream;
    await new Promise((resolve) => { video.onloadedmetadata = resolve; });
    await video.play();

    // Wait for video to stabilize (lighting adjustment)
    await new Promise((r) => setTimeout(r, 800));

    // Detect face with descriptor — all in browser, no server call
    const detection = await detectSingleFace(
      video,
      new SsdMobilenetv1Options({ minConfidence: 0.5 })
    ).withFaceLandmarks().withFaceDescriptor();

    return detection?.descriptor ?? null;
  } finally {
    // Always close camera — never leave it open
    stream?.getTracks().forEach((t) => t.stop());
    video.remove();
  }
}

/**
 * Register student's face — called once during setup.
 * @returns {{ success: boolean, message: string }}
 */
export async function registerFace() {
  const descriptor = await captureFaceDescriptor();
  if (!descriptor) return { success: false, message: 'No face detected. Try again in better lighting.' };

  try {
    const res = await api.post('/face/register', { descriptor: Array.from(descriptor) });
    return { success: true, message: res.data.message };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || 'Registration failed' };
  }
}

/**
 * Silent face verify — returns { verified, message }
 */
export async function verifyFaceSilently() {
  const descriptor = await captureFaceDescriptor();
  if (!descriptor) return { verified: false, message: 'Face not detected' };

  try {
    const res = await api.post('/face/verify', { descriptor: Array.from(descriptor) });
    return {
      verified: Boolean(res.data.match),
      message: res.data.match ? 'Face verified!' : 'Face did not match',
    };
  } catch (err) {
    const code = err.response?.data?.code;
    if (code === 'NOT_REGISTERED') return { verified: false, message: 'NOT_REGISTERED' };
    return { verified: false, message: err.response?.data?.message || 'Verification failed' };
  }
}

/**
 * Check if student has registered their face.
 * @returns {Promise<boolean>}
 */
export async function isFaceRegistered() {
  try {
    const res = await api.get('/face/status');
    return Boolean(res.data.registered);
  } catch {
    return false;
  }
}
