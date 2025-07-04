// src/app/design-sample-svg/page.tsx

'use client'; 
import PulpCard from '@/components/PulpCard'; // Import our new component
import { useAuth } from '@/context/AuthContext'; // Import the useAuth hook

export default function SvgBorderSamplePage() {
  const { user } = useAuth(); // Get the current user from the auth context

  return (
       <div>
      {/* This div is the dedicated background layer. */}
      <div 
        className="fixed inset-0 z-[-1]"
        style={{
          backgroundImage: "url('/bckgrnd3.jpg')",
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* --- THIS IS THE FIX --- */}
      {/* This is a new div that acts as our sepia overlay.
          - `mix-blend-color` tints the background with the specified color.
          - `bg-[#705446]/50` applies a semi-transparent sepia color.
            You can change the color hex code and the opacity (e.g., /40 for 40%) to get the exact tone you want.
      */}
      <div className="fixed inset-0 z-[-1] mix-blend-color bg-[#e3e3e3]/50" />
    <main className="flex flex-col items-center min-h-screen p-10">

         {/* --- NEW: The Site Title Header --- */}
      <div className="w-full max-w-4xl text-center mb-12">
        <h1 className="text-7xl font-bold text-black tracking-tight font-features-alt mt-0 p-0" style={{ fontFamily: 'Backover' }}>
        <div className="font-features-alt-2 inline">E</div>ternal balla<div className="font-features-alt-3 inline">D</div>
        </h1>
        <h2 className="text-5xl text-gray-700" style={{ fontFamily: 'Mythshire' }}>
          {/* This greeting is now dynamic */}
          a collaborative storytelling world
        </h2>
        
      </div>
      
      {/* We can now create a row of our reusable cards */}
      <div className="flex flex-wrap justify-center gap-3">

        <PulpCard 
          href="/story"
          imageUrl="/pulpart1.png" // Assumes you have this image in /public/art/
          title="How It Works"
          subtitle="Eternal Ballad is a collaborative storytelling rpg, allowing you the flexibility to write tales with others while interacting with AI game elements, like quests, game masters, and more. Here, you're in control."
          width={400} // You can optionally set a custom width
        />

        <PulpCard 
          href="/directory"
          imageUrl="/pulpart9.png"
          title="Our World"
          subtitle="Our World operates on the same SRD as many other ttrpgs out there, with one crucial difference-- you contribute to the lore and world directly. As you write, your words become legend."
          width={400}
          hoverInnerBorderColor='#CD5C5C'
          hoverOuterBorderColor='#800000'
        />

        <PulpCard 
          href="/library"
          imageUrl="/pulpart2.png"
          title="Library"
          subtitle="Read tales written in this world by our own Scribes. Discover a story to jump into."
          width={400}
        />
        
      </div>
    </main>
    </div>
  );
}