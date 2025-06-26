import Link from 'next/link'; // <-- 1. IMPORT THE LINK COMPONENT

// TypeScript interfaces remain the same...
interface Character {
  id: number;
  character_name: string;
  character_class: string;
  level: number;
  hp: number;
  mp: number;
}

interface CharacterCardProps {
  character: Character;
}

export default function CharacterCard({ character }: CharacterCardProps) {
  // 2. We wrap the entire 'li' element in a Link component.
  //    We use a template literal (the backticks ``) to build the dynamic URL.
  return (
    <Link href={`/characters/${character.id}`}>
      <li 
        className="p-4 bg-gray-900/70 rounded-md flex justify-between items-center border border-transparent hover:border-purple-500 transition-all cursor-pointer"
      >
        <div>
          <p className="text-xl font-semibold text-white">{character.character_name}</p>
          <p className="text-sm text-gray-400">Level {character.level} {character.character_class}</p>
        </div>
        <div className="text-right font-mono">
            <p className="text-xs text-green-400">HP: {character.hp}</p>
            <p className="text-xs text-blue-400">MP: {character.mp}</p>
        </div>
      </li>
    </Link>
  );
}