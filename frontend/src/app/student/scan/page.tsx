"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import QRCodeScanner from "@/components/QRCodeScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, CheckCircle } from "lucide-react";

export default function ScanPage() {
  // Ensure the user is authenticated and is a student
  const { user } = useAuth({
    requireAuth: true,
    redirectTo: "/login",
  });

  const [scanSuccess, setScanSuccess] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    rewardCoins: number;
    newBalance?: number;
  } | null>(null);

  const handleScanSuccess = (response: any) => {
    setScanSuccess(true);
    setResult({
      message: response.message,
      rewardCoins: response.rewardCoins,
      newBalance: response.newBalance,
    });
  };

  const handleScanError = (error: string) => {
    setScanSuccess(false);
    setResult({
      message: error,
      rewardCoins: 0,
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Scan QR Code</h1>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Activity QR Scanner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Scan the QR code provided by the activity organizer to confirm your participation.
              </p>

              <QRCodeScanner 
                onSuccess={handleScanSuccess}
                onError={handleScanError}
              />

              {scanSuccess && result && (
                <div className="mt-6 p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-800 dark:text-green-300">Success!</h3>
                      <p className="text-green-700 dark:text-green-400 mt-1">{result.message}</p>
                      
                      {result.rewardCoins > 0 && (
                        <p className="text-green-700 dark:text-green-400 mt-2">
                          You received <strong>{result.rewardCoins} VKU</strong> coins for participation.
                        </p>
                      )}
                      
                      {result.newBalance && (
                        <p className="text-green-700 dark:text-green-400 mt-1">
                          New balance: <strong>{result.newBalance} VKU</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!scanSuccess && result && (
                <div className="mt-6 p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900 rounded-lg">
                  <p className="text-red-700 dark:text-red-400">{result.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 