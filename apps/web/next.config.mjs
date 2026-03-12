/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // 允许从 monorepo 外部目录（如 packages/core、packages/storage）导入并编译 TS 代码
    externalDir: true
  }
};

export default nextConfig;

