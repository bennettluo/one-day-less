import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import type { UserLifeConfig, LifeStats } from "@one-day-less/core";
import {
  calculateLifeStats,
  validateConfig,
  ValidationErrorCode
} from "@one-day-less/core";
import { createAsyncStorageStorage } from "@one-day-less/storage";

type Screen = "onboarding" | "home" | "settings";

const storage = createAsyncStorageStorage();

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [config, setConfig] = useState<UserLifeConfig | null>(null);
  const [stats, setStats] = useState<LifeStats | null>(null);

  useEffect(() => {
    storage.loadUserLifeConfig().then(saved => {
      if (saved) {
        setConfig(saved);
        setStats(calculateLifeStats(saved));
        setScreen("home");
      } else {
        setScreen("onboarding");
      }
    });
  }, []);

  const handleConfigSaved = (c: UserLifeConfig) => {
    const s = calculateLifeStats(c);
    setConfig(c);
    setStats(s);
    setScreen("home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {screen === "onboarding" && (
        <OnboardingScreen onDone={handleConfigSaved} />
      )}
      {screen === "home" && config && stats && (
        <HomeScreen
          config={config}
          stats={stats}
          onOpenSettings={() => setScreen("settings")}
        />
      )}
      {screen === "settings" && config && (
        <SettingsScreen
          initialConfig={config}
          onBack={() => setScreen("home")}
          onSaved={handleConfigSaved}
        />
      )}
    </SafeAreaView>
  );
}

interface OnboardingProps {
  onDone: (config: UserLifeConfig) => void;
}

function OnboardingScreen({ onDone }: OnboardingProps) {
  const [birthDate, setBirthDate] = useState("");
  const [targetAge, setTargetAge] = useState("");
  const [error, setError] = useState<ValidationErrorCode | null>(null);

  const handleSubmit = async () => {
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
    onDone(config);
  };

  const errorText =
    error === ValidationErrorCode.TARGET_AGE_TOO_SMALL
      ? "你不想活了吗，哈哈。目标年龄要比现在大一点。"
      : error === ValidationErrorCode.INVALID_BIRTHDATE
        ? "生日格式不太对，再检查一下～"
        : error === ValidationErrorCode.INVALID_TARGET_AGE
          ? "目标年龄需要是一个大于 0 的数字。"
          : null;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>One Day Less</Text>
        <Text style={styles.subtitle}>又少了一天，你想怎么过？</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>你的生日（YYYY-MM-DD）</Text>
          <TextInput
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="例如 1990-01-01"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>你希望活到多少岁</Text>
          <TextInput
            value={targetAge}
            onChangeText={setTargetAge}
            placeholder="例如 90"
            placeholderTextColor="#6b7280"
            keyboardType="number-pad"
            style={styles.input}
          />
        </View>

        {errorText && <Text style={styles.error}>{errorText}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>开始计算</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface HomeProps {
  config: UserLifeConfig;
  stats: LifeStats;
  onOpenSettings: () => void;
}

function HomeScreen({ stats, onOpenSettings }: HomeProps) {
  const percent = Math.min(100, Math.max(0, Math.round(stats.percentLived * 100)));

  return (
    <View style={styles.screen}>
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.appName}>One Day Less</Text>
          <Text style={styles.homeSubtitle}>今天，又少了一天。</Text>
        </View>
        <TouchableOpacity onPress={onOpenSettings}>
          <Text style={styles.settingsLink}>设置</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.centerBlock}>
        <Text style={styles.caption}>你的一生还剩</Text>
        <Text style={styles.bigNumber}>
          {stats.daysLeft.toLocaleString("zh-CN")}
        </Text>
        <Text style={styles.daysText}>天</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.detailText}>
          你已经走过{" "}
          <Text style={styles.detailHighlight}>
            {stats.daysLived.toLocaleString("zh-CN")} 天
          </Text>
          ，约占一生的{" "}
          <Text style={styles.detailHighlight}>{percent}%</Text>。
        </Text>
      </View>

      <Text style={styles.footerText}>
        把今天当成最后一天来过，但别真的把它浪费掉。
      </Text>
    </View>
  );
}

interface SettingsProps {
  initialConfig: UserLifeConfig;
  onBack: () => void;
  onSaved: (config: UserLifeConfig) => void;
}

function SettingsScreen({ initialConfig, onBack, onSaved }: SettingsProps) {
  const [birthDate, setBirthDate] = useState(
    typeof initialConfig.birthDate === "string"
      ? initialConfig.birthDate
      : initialConfig.birthDate.toISOString().slice(0, 10)
  );
  const [targetAge, setTargetAge] = useState(String(initialConfig.targetAge));
  const [error, setError] = useState<ValidationErrorCode | null>(null);

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
    onSaved(config);
  };

  const errorText =
    error === ValidationErrorCode.TARGET_AGE_TOO_SMALL
      ? "你不想活了吗，哈哈。目标年龄要比现在大一点。"
      : error === ValidationErrorCode.INVALID_BIRTHDATE
        ? "生日格式不太对，再检查一下～"
        : error === ValidationErrorCode.INVALID_TARGET_AGE
          ? "目标年龄需要是一个大于 0 的数字。"
          : null;

  return (
    <View style={styles.screen}>
      <View style={styles.settingsHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.settingsLink}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.settingsTitle}>设置</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>你的生日（YYYY-MM-DD）</Text>
          <TextInput
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="例如 1990-01-01"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>你希望活到多少岁</Text>
          <TextInput
            value={targetAge}
            onChangeText={setTargetAge}
            placeholder="例如 90"
            placeholderTextColor="#6b7280"
            keyboardType="number-pad"
            style={styles.input}
          />
        </View>

        {errorText && <Text style={styles.error}>{errorText}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617"
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "space-between"
  },
  header: {
    alignItems: "center",
    marginTop: 16
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#f9fafb"
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#9ca3af"
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1f2937"
  },
  field: {
    marginBottom: 12
  },
  label: {
    fontSize: 13,
    color: "#e5e7eb",
    marginBottom: 6
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#f9fafb",
    fontSize: 13,
    backgroundColor: "#020617"
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: "#fb7185"
  },
  button: {
    marginTop: 10,
    backgroundColor: "#22c55e",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center"
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#020617"
  },
  homeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  appName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f9fafb"
  },
  homeSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#9ca3af"
  },
  settingsLink: {
    fontSize: 12,
    color: "#e5e7eb"
  },
  centerBlock: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1
  },
  caption: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#6b7280"
  },
  bigNumber: {
    marginTop: 14,
    fontSize: 48,
    fontWeight: "700",
    color: "#22c55e"
  },
  daysText: {
    fontSize: 14,
    color: "#e5e7eb"
  },
  progressTrack: {
    marginTop: 18,
    height: 8,
    width: "80%",
    borderRadius: 999,
    backgroundColor: "#111827",
    overflow: "hidden"
  },
  progressBar: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#22c55e"
  },
  detailText: {
    marginTop: 10,
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center"
  },
  detailHighlight: {
    color: "#f9fafb",
    fontWeight: "500"
  },
  footerText: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f9fafb"
  }
});

