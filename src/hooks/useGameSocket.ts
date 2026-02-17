"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

export type Phase = "betting" | "revealing";

interface BettingStats {
  tai: { count: number; totalAmount: number };
  xiu: { count: number; totalAmount: number };
  chan: { count: number; totalAmount: number };
  le: { count: number; totalAmount: number };
}

interface UseGameSocketOptions {
  onNotify: (args: { title: string; description?: string; variant?: "destructive" | undefined }) => void;
  onBalanceUpdate: () => void;
}

export function useGameSocket({ onNotify, onBalanceUpdate }: UseGameSocketOptions) {
  const [countdown, setCountdown] = useState(45);
  const [phase, setPhase] = useState<Phase>("betting");
  const [isRolling, setIsRolling] = useState(false);
  const [diceResults, setDiceResults] = useState<number[]>([]);
  const [gameResult, setGameResult] = useState<"tai" | "xiu" | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [lastSessionId, setLastSessionId] = useState("");
  const [canReveal, setCanReveal] = useState(false);
  const [bettingStats, setBettingStats] = useState<BettingStats>({
    tai: { count: 0, totalAmount: 0 },
    xiu: { count: 0, totalAmount: 0 },
    chan: { count: 0, totalAmount: 0 },
    le: { count: 0, totalAmount: 0 },
  });

  useEffect(() => {
    const socket = getSocket();

    const onSessionStart = (data: any) => {

      setLastSessionId(data.sessionId);
      setSessionId(data.sessionId);
      setCountdown(data.bettingTime);
      setPhase("betting");
      setIsRolling(false);
      setDiceResults([]);
      setGameResult(null);
      setCanReveal(false);
      setBettingStats({
        tai: { count: 0, totalAmount: 0 },
        xiu: { count: 0, totalAmount: 0 },
        chan: { count: 0, totalAmount: 0 },
        le: { count: 0, totalAmount: 0 },
      });
    };

    const onCountdown = (data: any) => {
      setCountdown(data.remainingTime);
      setPhase(data.phase);
      if (data.bettingStats) {
        setBettingStats({
          tai: data.bettingStats.tai || { count: 0, totalAmount: 0 },
          xiu: data.bettingStats.xiu || { count: 0, totalAmount: 0 },
          chan: data.bettingStats.chan || { count: 0, totalAmount: 0 },
          le: data.bettingStats.le || { count: 0, totalAmount: 0 },
        });
      }
    };

    const onBettingStats = (data: any) => {
      setBettingStats(data);
    };

    const onBettingClosed = () => {
      setIsRolling(true);
      onNotify({ title: "🎲 Đóng cửa cược", description: "Đang lắc xúc xắc..." });
    };

    const onDiceRolled = (data: any) => {
      setTimeout(() => {
        setIsRolling(false);
        setDiceResults(data.diceResults);
        setGameResult(data.result);
        setCanReveal(true);
        onBalanceUpdate();
      }, 2000);
    };

    const onBetPlaced = (data: any) => {

      onNotify({ title: "Đặt cược thành công!", description: `${String(data.bet).toUpperCase()} - ${Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.amount)}` });
      onBalanceUpdate();
    };

    const onError = (data: any) => {
      onNotify({ title: "Lỗi", description: data.message, variant: "destructive" });
    };

    socket.on("sessionStart", onSessionStart);
    socket.on("countdown", onCountdown);
    socket.on("bettingStats", onBettingStats);
    socket.on("bettingClosed", onBettingClosed);
    socket.on("diceRolled", onDiceRolled);
    socket.on("betPlaced", onBetPlaced);
    socket.on("error", onError);

    return () => {
      socket.off("sessionStart", onSessionStart);
      socket.off("countdown", onCountdown);
      socket.off("bettingStats", onBettingStats);
      socket.off("bettingClosed", onBettingClosed);
      socket.off("diceRolled", onDiceRolled);
      socket.off("betPlaced", onBetPlaced);
      socket.off("error", onError);
    };
  }, [onNotify, onBalanceUpdate]);

  const placeBet = (payload: { userId: string; bet: "tai" | "xiu" | "chan" | "le"; amount: number }) => {

    const socket = getSocket();
    socket.emit("placeBet", payload);
  };

  return {
    countdown,
    phase,
    isRolling,
    diceResults,
    gameResult,
    sessionId,
    lastSessionId,
    canReveal,
    bettingStats,
    placeBet,
  };
}
