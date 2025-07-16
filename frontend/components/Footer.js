export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-4">© 2025 MintonShardeum Powered by Shardeum</p>
        <div className="social-links flex justify-center space-x-4">
          <a href="https://discord.com/invite/shardeum" target="_blank" rel="nofollow">
            <img src="/images/discord.svg" alt="Discord" className="w-6 h-6" />
          </a>
          <a href="https://github.com/BrunoMarshall/mintonshardeum" target="_blank" rel="nofollow">
            <img src="/images/github.svg" alt="GitHub" className="w-6 h-6" />
          </a>
          <a href="https://www.linkedin.com/company/shardeum/" target="_blank" rel="nofollow">
            <img src="/images/linkedin.svg" alt="LinkedIn" className="w-6 h-6" />
          </a>
          <a href="https://t.me/shardeum" target="_blank" rel="nofollow">
            <img src="/images/telegram.svg" alt="Telegram" className="w-6 h-6" />
          </a>
          <a href="https://x.com/shardeum" target="_blank" rel="nofollow">
            <img src="/images/twitter.svg" alt="X" className="w-6 h-6" />
          </a>
          <a href="https://www.youtube.com/@shardeum" target="_blank" rel="nofollow">
            <img src="/images/youtube.svg" alt="YouTube" className="w-6 h-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}