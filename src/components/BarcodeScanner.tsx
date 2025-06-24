import React, { useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    const videoElement = videoRef.current;
    if (videoElement) {
      codeReader.current.decodeFromVideoDevice(undefined, videoElement, (result, err) => {
        if (result) {
          onDetected(result.getText());
        }
      });
    }
    return () => {
      codeReader.current?.reset();
    };
  }, [onDetected]);

  return (
    <div>
      <video ref={videoRef} style={{ width: '100%' }} />
    </div>
  );
};

export default BarcodeScanner;
