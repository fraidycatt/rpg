import CharacterCard from '@/components/CharacterCard'; // <-- 1. IMPORT our new component

// This function fetches our character data from the backend
async function getCharacters() {
  // We add 'no-store' to ensure we get fresh data every time during development
  const res = await fetch('http://localhost:3001/api/characters', { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch characters');
  }
  return res.json();
}

// This is our main Home page component
export default async function Home() {
  const characters = await getCharacters();

  return (
    // We've added classes to the main element for a dark theme
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-900 text-white">
      <div className="z-10 w-full max-w-5xl">
        {/* Style the main header */}
        <h1 className="text-4xl sm:text-5xl font-thin mb-8 text-center text-blue-400 tracking-widest uppercase font-[Helvetica]">
          Character Roster
        </h1>

        {/* Create a styled container for our list */}
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-2xl border border-gray-700 max-w-2xl mx-auto">
          <ul className="space-y-4 h-96 overflow-y-auto">
            {/* We map over the character data to create a list item for each one */}
            {characters.map((character: any) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </ul>
        </div>

      </div>
    </main>
  );
}