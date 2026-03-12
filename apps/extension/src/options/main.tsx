import React from "react";
import ReactDOM from "react-dom/client";

function OptionsApp() {
  return (
    <div className="min-h-screen bg-black px-6 py-8 text-slate-100">
      <h1 className="text-lg font-semibold text-white">One Day Less 设置</h1>
      <p className="mt-3 text-sm text-slate-300">
        目前所有设置都在弹窗中完成。点击浏览器工具栏中的 One Day Less
        图标，就可以打开弹窗进行查看和修改。
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>
);

