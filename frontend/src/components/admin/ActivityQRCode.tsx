"use client";

import { useState, useEffect } from "react";
import { http } from "@/lib/http-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// Get the base API URL from environment or use the default
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5219/api";
const API_BASE_URL = API_URL.replace('/api', '');

interface ActivityQRCodeProps {
  activityId: number;
  activityName: string;
}

export function ActivityQRCode({ activityId, activityName }: ActivityQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [fullQrCodeUrl, setFullQrCodeUrl] = useState<string | null>(null);
  const [expiration, setExpiration] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQRCode = async () => {
    setIsLoading(true);
    try {
      const response = await http.get(`/admin/activities/${activityId}/qrcode`);
      setQrCodeUrl(response.qrCodeUrl);
      
      // Create the full URL by combining the base API URL with the relative QR code URL
      const fullUrl = `${API_BASE_URL}${response.qrCodeUrl}`;
      setFullQrCodeUrl(fullUrl);
      
      setExpiration(new Date(response.qrCodeExpiration));
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
      toast.error("Failed to load QR code");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCode();
  }, [activityId]);

  const handleDownload = () => {
    if (!fullQrCodeUrl) return;
    
    // Create a temporary link element
    const link = document.createElement("a");
    link.href = fullQrCodeUrl;
    link.download = `activity-${activityId}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code for {activityName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : fullQrCodeUrl ? (
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <img 
                src={fullQrCodeUrl} 
                alt={`QR Code for ${activityName}`} 
                className="w-64 h-64 object-contain"
              />
            </div>
            
            {expiration && (
              <p className="text-sm text-gray-500">
                Expires on: {format(expiration, "PPP 'at' p")}
              </p>
            )}
            
            <div className="flex gap-2 mt-2">
              <Button onClick={handleDownload} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download QR Code
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchQRCode}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No QR code available for this activity.</p>
            <Button onClick={fetchQRCode} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Generate QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 