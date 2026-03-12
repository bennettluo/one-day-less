import { useEffect, useState } from "react";
import { View, Text, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import type { UserLifeConfig, LifeStats } from "@one-day-less/core";
import { calculateLifeStats } from "@one-day-less/core";
import { createWechatStorage } from "@one-day-less/storage";

const storage = createWechatStorage();

export default function HomePage() {
  const [config, setConfig] = useState<UserLifeConfig | null>(null);
  const [stats, setStats] = useState<LifeStats | null>(null);

  useEffect(() => {
    storage.loadUserLifeConfig().then(saved => {
      if (!saved) {
        Taro.redirectTo({ url: "/pages/onboarding/index" });
        return;
      }
      setConfig(saved);
      setStats(calculateLifeStats(saved));
    });
  }, []);

  if (!config || !stats) {
    return (
      <View className="page page-center">
        <Text className="loading">加载中…</Text>
      </View>
    );
  }

  const percent = Math.min(100, Math.max(0, Math.round(stats.percentLived * 100)));

  return (
    <View className="page">
      <View className="home-header">
        <View>
          <Text className="app-name">One Day Less</Text>
          <Text className="home-subtitle">今天，又少了一天。</Text>
        </View>
        <Button
          className="link-button"
          onClick={() => Taro.navigateTo({ url: "/pages/settings/index" })}
        >
          设置
        </Button>
      </View>

      <View className="center">
        <Text className="caption">你的一生还剩</Text>
        <Text className="big-number">
          {stats.daysLeft.toLocaleString("zh-CN")}
        </Text>
        <Text className="days">天</Text>

        <View className="progress-track">
          <View className="progress-bar" style={{ width: `${percent}%` }} />
        </View>
        <Text className="detail">
          你已经走过{" "}
          <Text className="detail-strong">
            {stats.daysLived.toLocaleString("zh-CN")} 天
          </Text>
          ，约占一生的{" "}
          <Text className="detail-strong">{percent}%</Text>。
        </Text>
      </View>

      <Text className="footer">
        把今天当成最后一天来过，但别真的把它浪费掉。
      </Text>
    </View>
  );
}

