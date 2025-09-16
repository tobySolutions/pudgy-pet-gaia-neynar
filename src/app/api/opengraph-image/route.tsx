import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');

  const user = fid ? await getNeynarUser(Number(fid)) : null;

  return new ImageResponse(
    (
      <div tw="flex h-full w-full flex-col justify-center items-center relative" style={{
        background: 'linear-gradient(135deg, #F5FDFF 0%, #E9F7FB 50%, #FBE9F3 100%)'
      }}>
        {/* Pudgy Penguin Image as main visual */}
        <img 
          src={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/pudgy-image.jpg`}
          alt="Pudgy Penguin" 
          tw="w-64 h-64 mb-8 rounded-full object-cover border-4 border-white shadow-lg"
        />
        
        {/* Focus purely on Pudgy branding - no user PFP */}
        
        {/* Main Title */}
        <h1 tw="text-7xl font-bold text-center mb-4" style={{
          color: '#00142D',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          {user?.display_name ? `${user.display_name}'s Pudgy Pet!` : 'Meet Your Pudgy Pet!'}
        </h1>
        
        {/* Subtitle */}
        <p tw="text-4xl text-center mb-6" style={{
          color: '#477DFD'
        }}>
          Your AI Penguin Companion ✨
        </p>
        
        {/* Footer */}
        <div tw="flex items-center text-2xl" style={{
          color: '#00142D',
          opacity: 0.8
        }}>
          <span tw="mr-2">🪐</span>
          <span>Powered by Gaia AI</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 800,
    }
  );
}