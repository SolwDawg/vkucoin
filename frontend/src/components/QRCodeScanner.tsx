"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { http } from "@/lib/http-client";

interface QRCodeScannerProps {
  onSuccess?: (result: { message: string; rewardCoins: number; newBalance: number }) => void;
  onError?: (error: string) => void;
}

export default function QRCodeScanner({ onSuccess, onError }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const startScanner = () => {
    setIsScanning(true);
    setScanResult(null);

    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      /* verbose= */ false
    );

    scannerRef.current.render(onScanSuccess, onScanFailure);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    console.log(`QR Code detected: ${decodedText}`);
    setScanResult(decodedText);
    stopScanner();
    
    try {
      // Send the QR code data to the backend
      const response = await http.post("/student/Student/scan-qr-code", {
        qrCodePayload: decodedText
      });
      
      toast.success("QR Code verified successfully!");
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error("Error verifying QR code:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to verify QR code";
      
      toast.error(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const onScanFailure = (error: string) => {
    console.warn(`QR Code scanning failed: ${error}`);
    // Don't show toast for scan failures as they happen frequently during scanning
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-4">
        {!isScanning ? (
          <Button onClick={startScanner} className="w-full">
            Start QR Code Scanner
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="outline" className="w-full">
            Stop Scanner
          </Button>
        )}

        <div id="qr-reader" className="w-full"></div>

        {scanResult && (
          <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-800 w-full">
            <h3 className="font-medium mb-2">Scan Result:</h3>
            <p className="text-sm break-all">{scanResult}</p>
          </div>
        )}
      </div>
    </div>
  );
} 