import React from 'react';

function KameraVideo({ videoRef }) {
  return (
    <video
      ref={videoRef}
      style={{ width: '100%', maxHeight: '350px', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #ccc' }}
      autoPlay
      muted
      playsInline
    />
  );
}

export default KameraVideo;