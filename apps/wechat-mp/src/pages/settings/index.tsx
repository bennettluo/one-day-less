import { useEffect, useState } from "react";
import { View, Text, Input, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import type { UserLifeConfig } from "@one-day-less/core";
import {
  validateConfig,
  ValidationErrorCode
} from "@one-day-less/core";
import { createWechatStorage } from "@one-day-less/storage";

const storage = createWechatStorage();

export default function SettingsPage() {
  const [birthDate, setBirthDate] = useState("");
  const [targetAge, setTargetAge] = useState("");
  const [error, setError] = useState<ValidationErrorCode | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storage.loadUserLifeConfig().then(config => {
      if (!config) {
        Taro.redirectTo({ url: "/pages/onboarding/index" });
        return;
      }
      setBirthDate(
        typeof config.birthDate === "string"
          ? config.birthDate
          : config.birthDate.toString()
      );
      setTargetAge(String(config.targetAge));
      setLoaded(true);
    });
  }, []);

  const handleSave = async () => {
    setError(null);
    const targetAgeNumber = Number(targetAge);
    const config: UserLifeConfig = {
      birthDate,
      targetAge: targetAgeNumber
    };
    const result = validateConfig(config);
    if (!result.ok) {
      setError(result.errorCode ?? null);
      return;
    }
    await storage.saveUserLifeConfig(config);
    Taro.navigateBack().catch(() => {
      Taro.redirectTo({ url: "/pages/home/index" });
    });
  };

  const renderError = () => {
    if (!error) return null;
    if (error === ValidationErrorCode.TARGET_AGE_TOO_SMALL) {
      return (
        <Text className="text-error">
          你不想活了吗，哈哈。目标年龄要比现在大一点。
        </Text>
      );
    }
    if (error === ValidationErrorCode.INVALID_BIRTHDATE) {
      return <Text className="text-error">生日格式不太对，再检查一下～</Text>;
    }
    if (error === ValidationErrorCode.INVALID_TARGET_AGE) {
      return (
        <Text className="text-error">目标年龄需要是一个大于 0 的数字。</Text>
      );
    }
    return null;
  };

  if (!loaded) {
    return (
      <View className="page page-center">
        <Text className="loading">加载中…</Text>
      </View>
    );
  }

  return (
    <View className="page">
      <View className="settings-header">
        <Button
          className="link-button"
          onClick={() => Taro.navigateBack()}
        >
          ← 返回
        </Button>
        <Text className="settings-title">设置</Text>
        <View style={{ width: 40 }} />
      </View>

      <View className="card">
        <View className="field">
          <Text className="label">你的生日（YYYY-MM-DD）</Text>
          <Input
            value={birthDate}
            onInput={e => setBirthDate(e.detail.value)}
          />
        </View>
        <View className="field">
          <Text className="label">你希望活到多少岁</Text>
          <Input
            value={targetAge}
            onInput={e => setTargetAge(e.detail.value)}
            type="number"
          />
        </View>
        {renderError()}
        <Button className="primary" onClick={handleSave}>
          保存
        </Button>
      </View>
    </View>
  );
}

