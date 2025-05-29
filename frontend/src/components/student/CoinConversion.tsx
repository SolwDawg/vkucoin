"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { studentService } from "@/services/student.service";
import { walletService } from "@/services/wallet.service";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export function CoinConversion() {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const { user, wallet, updateWalletBalance, updateUser } = useAuthStore();

  // Fetch current wallet balance and training points on component mount
  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        if (wallet) {
          setBalance(wallet.balance);
        } else {
          const walletInfo = await walletService.getWalletInfo();
          setBalance(walletInfo.vkuBalance);
          updateWalletBalance(walletInfo.vkuBalance);
        }
        
        if (user) {
          setPoints(user.trainingPoints || 0);
        }
      } catch (err) {
        setError("Không thể tải thông tin ví");
        console.error("Error fetching wallet info:", err);
      }
    };

    fetchWalletInfo();
  }, [wallet, user, updateWalletBalance]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
    
    // Clear any previous error or success messages when user changes the amount
    setError(null);
    setSuccess(null);
  };

  const handleConvert = async () => {
    // Validate amount
    if (!amount || amount <= 0) {
      setError("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    if (amount % 10 !== 0) {
      setError("Số lượng phải chia hết cho 10 (10 xu = 1 điểm)");
      return;
    }

    if (amount > balance) {
      setError(`Số dư không đủ. Bạn có ${balance} xu.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Call the API to convert coins to points
      const response = await studentService.convertCoinsToPoints(amount);
      
      // Update local state with new values
      setBalance(response.newBalance);
      setPoints(response.newPoints);
      
      // Update global state
      updateWalletBalance(response.newBalance);
      if (user) {
        updateUser({
          ...user,
          trainingPoints: response.newPoints
        });
      }
      
      // Show success message
      setSuccess(response.message);

      // Reset form
      setAmount(0);
    } catch (err: any) {
      // Handle different types of errors
      if (err.status === 400) {
        setError(err.data?.message || "Yêu cầu không hợp lệ. Vui lòng kiểm tra thông tin đầu vào.");
      } else if (err.status === 500) {
        setError("Lỗi máy chủ. Vui lòng thử lại sau.");
      } else {
        setError(err.message || "Không thể chuyển đổi xu thành điểm");
      }
      console.error("Error converting coins:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Chuyển đổi xu thành điểm</CardTitle>
        <CardDescription>
          Đổi VKU Coin của bạn lấy điểm rèn luyện (10 xu = 1 điểm)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Số dư hiện tại</p>
            <p className="text-xl font-bold">{balance} VKU</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Điểm rèn luyện</p>
            <p className="text-xl font-bold">{points} Điểm</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">Số lượng (xu)</Label>
          <div className="flex space-x-2">
            <Input
              id="amount"
              type="number"
              min="10"
              step="10"
              value={amount || ""}
              onChange={handleAmountChange}
              placeholder="Nhập số lượng (bội số của 10)"
              disabled={loading}
            />
            <Button
              onClick={handleConvert}
              disabled={loading || amount <= 0 || amount % 10 !== 0 || amount > balance}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang chuyển đổi...
                </>
              ) : (
                "Chuyển đổi"
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Bạn sẽ nhận được {Math.floor(amount / 10)} điểm rèn luyện
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-500 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Thành công</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex-col space-y-2">
        <div className="text-sm text-muted-foreground">
          <p>• Số lượng chuyển đổi tối thiểu là 10 xu</p>
          <p>• Xu được chuyển đổi theo tỷ lệ 10:1 (10 xu = 1 điểm)</p>
          <p>• Việc chuyển đổi không thể hoàn tác</p>
        </div>
      </CardFooter>
    </Card>
  );
} 