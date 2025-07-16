import Image from 'next/image';

export default function Header() {
  return (
    <header style={{ textAlign: 'center', padding: '20px' }}>
      <Image
        src="/mintonshardeum_logo.png"
        alt="Minton Shardeum Logo"
        width={150}
        height={50}
      />
      <h1>Minton: Forge Tokens on Shardeum</h1>
      <p>Join Minton, the Token Forger, to create your own tokens on Shardeum!</p>
    </header>
  );
}