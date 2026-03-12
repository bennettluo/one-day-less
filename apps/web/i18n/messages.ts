import type { Language } from "./config";

export type MessageKey =
  | "app.title"
  | "app.subtitle"
  | "onboarding.name.label"
  | "onboarding.name.placeholder"
  | "onboarding.origin.label"
  | "onboarding.origin.placeholder"
  | "onboarding.birthDate.label"
  | "onboarding.birthDate.help"
  | "onboarding.targetAge.label"
  | "onboarding.targetAge.placeholder"
  | "onboarding.submit"
  | "onboarding.footer"
  | "home.header.subtitle"
  | "home.section.title"
  | "home.section.unit.day"
  | "home.countdown.caption"
  | "home.progress.text"
  | "home.footer"
  | "settings.title"
  | "settings.language"
  | "settings.back"
  | "settings.save"
  | "settings.birthDate.label"
  | "settings.targetAge.label"
  | "settings.reset.title"
  | "settings.reset.description"
  | "settings.reset.action"
  | "settings.reset.confirm"
  | "cta.settings"
  | "loading"
  | "error.targetAge.tooSmall"
  | "error.birthDate.invalid"
  | "error.targetAge.invalid";

export type Messages = Record<MessageKey, string>;

const zhCN: Messages = {
  "app.title": "One Day Less",
  "app.subtitle": "又少了一天，你想怎么过？",
  "onboarding.name.label": "你叫什么名字",
  "onboarding.name.placeholder": "例如 李雷、Hanako",
  "onboarding.origin.label": "你来自哪里",
  "onboarding.origin.placeholder": "例如 北京、日本东京",
  "onboarding.birthDate.label": "你的生日",
  "onboarding.birthDate.help": "选一个真实的生日，接下来的数字才有意义。",
  "onboarding.targetAge.label": "你希望活到多少岁",
  "onboarding.targetAge.placeholder": "例如 80、90",
  "onboarding.submit": "开始计算",
  "onboarding.footer": "不再只盯着银行余额，开始看看生命余额。",
  "home.header.subtitle": "今天，又少了一天。你打算怎么用？",
  "home.section.title": "你的一生还剩",
  "home.section.unit.day": "天",
  "home.countdown.caption": "生命在跳动",
  "home.progress.text": "你已经走过 {days} 天，约占一生的 {percent}%。",
  "home.footer": "把今天当成最后一天来过，但别把它浪费掉。",
  "settings.title": "设置",
  "settings.language": "语言",
  "settings.back": "← 返回",
  "settings.save": "保存",
  "settings.birthDate.label": "你的生日",
  "settings.targetAge.label": "你希望活到多少岁",
  "settings.reset.title": "重置所有数据",
  "settings.reset.description":
    "One Day Less 的初衷是只设置一次。如果你真的想重新开始，可以清空本地数据并回到最开始的问题。",
  "settings.reset.action": "清空并重新开始",
  "settings.reset.confirm":
    "确定要清空本地数据并重新开始吗？这个操作不可恢复。",
  "cta.settings": "设置",
  "loading": "加载中…",
  "error.targetAge.tooSmall":
    "你不想活了吗，哈哈。目标年龄要比现在大一点。",
  "error.birthDate.invalid": "生日好像不太对，再检查一下～",
  "error.targetAge.invalid": "目标年龄需要是一个大于 0 的数字。"
};

const enUS: Messages = {
  "app.title": "One Day Less",
  "app.subtitle": "One more day is gone. How will you live today?",
  "onboarding.name.label": "What is your name",
  "onboarding.name.placeholder": "For example Alex, Yuki",
  "onboarding.origin.label": "Where are you from",
  "onboarding.origin.placeholder": "For example Shanghai, New York",
  "onboarding.birthDate.label": "Your birthday",
  "onboarding.birthDate.help":
    "Use your real birthday so the numbers truly reflect your life.",
  "onboarding.targetAge.label": "How old do you want to live to",
  "onboarding.targetAge.placeholder": "For example 80 or 90",
  "onboarding.submit": "Start counting",
  "onboarding.footer":
    "Stop checking only your bank balance. Start checking your life balance.",
  "home.header.subtitle":
    "Another day is gone. What will you do with what remains?",
  "home.section.title": "You have about this much life left",
  "home.section.unit.day": "days",
  "home.countdown.caption": "Your life is beating",
  "home.progress.text":
    "You have already lived {days} days, about {percent}% of your life.",
  "home.footer":
    "Live today as if it were your last, but don’t actually waste it.",
  "settings.title": "Settings",
  "settings.language": "Language",
  "settings.back": "← Back",
  "settings.save": "Save",
  "settings.birthDate.label": "Your birthday",
  "settings.targetAge.label": "How old do you want to live to",
  "settings.reset.title": "Reset all data",
  "settings.reset.description":
    "You only set this once. If you really want to start over, you can clear local data and go back to the first questions.",
  "settings.reset.action": "Clear data and restart",
  "settings.reset.confirm":
    "Are you sure you want to clear local data and start over? This cannot be undone.",
  "cta.settings": "Settings",
  "loading": "Loading…",
  "error.targetAge.tooSmall":
    "So you don't want to live any longer? 😄 Aim a bit higher.",
  "error.birthDate.invalid": "That birthday doesn’t look right.",
  "error.targetAge.invalid": "Target age must be a number greater than 0."
};

const esES: Messages = {
  "app.title": "One Day Less",
  "app.subtitle": "Ha pasado un día más. ¿Cómo vivirás hoy?",
  "onboarding.name.label": "¿Cómo te llamas?",
  "onboarding.name.placeholder": "Por ejemplo Alex, María",
  "onboarding.origin.label": "¿De dónde eres?",
  "onboarding.origin.placeholder": "Por ejemplo Madrid, Ciudad de México",
  "onboarding.birthDate.label": "Tu fecha de nacimiento",
  "onboarding.birthDate.help":
    "Usa tu fecha de nacimiento real para que los números reflejen tu vida.",
  "onboarding.targetAge.label": "Hasta qué edad quieres vivir",
  "onboarding.targetAge.placeholder": "Por ejemplo 80 o 90",
  "onboarding.submit": "Empezar a contar",
  "onboarding.footer":
    "Deja de mirar solo el saldo del banco. Empieza a mirar el saldo de tu vida.",
  "home.header.subtitle":
    "Otro día se ha ido. ¿Qué harás con lo que queda?",
  "home.section.title": "Te queda aproximadamente esta vida",
  "home.section.unit.day": "días",
  "home.countdown.caption": "Tu vida está latiendo",
  "home.progress.text":
    "Ya has vivido {days} días, alrededor del {percent}% de tu vida.",
  "home.footer":
    "Vive hoy como si fuera el último, pero no lo desperdicies.",
  "settings.title": "Ajustes",
  "settings.language": "Idioma",
  "settings.back": "← Atrás",
  "settings.save": "Guardar",
  "settings.birthDate.label": "Tu fecha de nacimiento",
  "settings.targetAge.label": "Hasta qué edad quieres vivir",
  "settings.reset.title": "Restablecer todos los datos",
  "settings.reset.description":
    "Solo configuras esto una vez. Si quieres empezar de nuevo, puedes borrar los datos locales y volver a las preguntas iniciales.",
  "settings.reset.action": "Borrar datos y reiniciar",
  "settings.reset.confirm":
    "¿Seguro que quieres borrar los datos locales y empezar de nuevo? Esta acción no se puede deshacer.",
  "cta.settings": "Ajustes",
  "loading": "Cargando…",
  "error.targetAge.tooSmall":
    "¿No quieres vivir más? 😄 Apunta un poco más alto.",
  "error.birthDate.invalid": "Esa fecha de nacimiento no parece correcta.",
  "error.targetAge.invalid":
    "La edad objetivo debe ser un número mayor que 0."
};

const frFR: Messages = {
  "app.title": "One Day Less",
  "app.subtitle": "Un jour de plus est passé. Comment vivras-tu aujourd’hui ?",
  "onboarding.name.label": "Comment t’appelles-tu ?",
  "onboarding.name.placeholder": "Par exemple Alex, Marie",
  "onboarding.origin.label": "D’où viens-tu ?",
  "onboarding.origin.placeholder": "Par exemple Paris, Montréal",
  "onboarding.birthDate.label": "Ta date de naissance",
  "onboarding.birthDate.help":
    "Utilise ta vraie date de naissance pour que les chiffres reflètent vraiment ta vie.",
  "onboarding.targetAge.label": "Jusqu’à quel âge veux-tu vivre",
  "onboarding.targetAge.placeholder": "Par exemple 80 ou 90",
  "onboarding.submit": "Commencer le calcul",
  "onboarding.footer":
    "Arrête de regarder seulement ton solde bancaire. Regarde aussi le solde de ta vie.",
  "home.header.subtitle":
    "Un autre jour s’est envolé. Que feras-tu de ce qu’il reste ?",
  "home.section.title": "Il te reste environ",
  "home.section.unit.day": "jours",
  "home.countdown.caption": "Ta vie bat",
  "home.progress.text":
    "Tu as déjà vécu {days} jours, soit environ {percent}% de ta vie.",
  "home.footer":
    "Vis aujourd’hui comme si c’était le dernier, sans le gâcher pour autant.",
  "settings.title": "Réglages",
  "settings.language": "Langue",
  "settings.back": "← Retour",
  "settings.save": "Enregistrer",
  "settings.birthDate.label": "Ta date de naissance",
  "settings.targetAge.label": "Jusqu’à quel âge veux-tu vivre",
  "settings.reset.title": "Réinitialiser toutes les données",
  "settings.reset.description":
    "Tu ne règles ceci qu’une seule fois. Si tu veux vraiment recommencer, tu peux effacer les données locales et revenir aux premières questions.",
  "settings.reset.action": "Effacer les données et recommencer",
  "settings.reset.confirm":
    "Es-tu sûr de vouloir effacer les données locales et recommencer ? Cette action est irréversible.",
  "cta.settings": "Réglages",
  "loading": "Chargement…",
  "error.targetAge.tooSmall":
    "Tu ne veux plus vivre ? 😄 Vise un peu plus haut.",
  "error.birthDate.invalid": "Cette date de naissance ne semble pas correcte.",
  "error.targetAge.invalid":
    "L’âge cible doit être un nombre supérieur à 0."
};

const jaJP: Messages = {
  "app.title": "One Day Less",
  "app.subtitle": "今日も一日減りました。今日はどう生きますか？",
  "onboarding.name.label": "あなたの名前",
  "onboarding.name.placeholder": "例：太郎、Hanako",
  "onboarding.origin.label": "どこから来ましたか",
  "onboarding.origin.placeholder": "例：東京、中国・上海",
  "onboarding.birthDate.label": "あなたの誕生日",
  "onboarding.birthDate.help":
    "本当の誕生日を入力すると、この先の数字に意味が生まれます。",
  "onboarding.targetAge.label": "何歳まで生きたいですか",
  "onboarding.targetAge.placeholder": "例：80、90",
  "onboarding.submit": "計算を始める",
  "onboarding.footer":
    "銀行口座の残高だけでなく、人生の残高も見てみよう。",
  "home.header.subtitle":
    "今日も一日が終わりました。残りの時間をどう使いますか？",
  "home.section.title": "あなたの人生の残りはだいたい",
  "home.section.unit.day": "日",
  "home.countdown.caption": "あなたの命は鼓動している",
  "home.progress.text":
    "あなたはすでに {days} 日生きており、人生の約 {percent}% です。",
  "home.footer":
    "今日を最後の日だと思って生きよう。でも、本当に無駄にしないで。",
  "settings.title": "設定",
  "settings.language": "言語",
  "settings.back": "← 戻る",
  "settings.save": "保存",
  "settings.birthDate.label": "あなたの誕生日",
  "settings.targetAge.label": "何歳まで生きたいか",
  "settings.reset.title": "すべてのデータをリセット",
  "settings.reset.description":
    "これは一度だけ設定します。本当にやり直したい場合は、ローカルデータを消して最初の質問に戻ることができます。",
  "settings.reset.action": "データを消してやり直す",
  "settings.reset.confirm":
    "ローカルデータを消してやり直してもよろしいですか？この操作は元に戻せません。",
  "cta.settings": "設定",
  "loading": "読み込み中…",
  "error.targetAge.tooSmall":
    "もう生きたくないの？ 😄 もう少し高めに設定しよう。",
  "error.birthDate.invalid":
    "誕生日が正しくないようです。もう一度確認してください。",
  "error.targetAge.invalid":
    "目標年齢は 0 より大きい数値である必要があります。"
};

export const dictionaries: Record<Language, Messages> = {
  "zh-CN": zhCN,
  "en-US": enUS,
  "es-ES": esES,
  "fr-FR": frFR,
  "ja-JP": jaJP
};

