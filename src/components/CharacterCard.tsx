// This is TypeScript. We're defining the "shape" of the data our component expects.
// It says: "This component MUST receive a prop named 'character' that has these specific fields."
interface Character {
  id: number;
  character_name: string;
  character_class: string;
  level: number;
  hp: number;
  mp: number;
  xp: number;
}

interface CharacterCardProps {
  character: Character;
}

// This is our new React component. It receives 'props' as an argument.
// We are "destructuring" the props to get the 'character' object directly.
export default function CharacterCard({ character }: CharacterCardProps) {
  return (
    <li 
      className="p-4 bg-gray-900/70 rounded-md flex justify-between items-center border border-transparent hover:border-purple-500 transition-all cursor-pointer"
    >
      {/* A container for the character's name and class */}
      <div>
        <p className="text-xl font-semibold text-white">{character.character_name}</p>
        <p className="text-sm text-gray-400">Level {character.level} {character.character_class}</p>
      </div>
      {/* A container for their stats, aligned to the right */}
      <div className="text-right font-mono">
          <p className="text-xs text-green-400">HP: {character.hp}</p>
          <p className="text-xs text-blue-400">MP: {character.mp}</p>
          <p className="text-xs text-green-400">XP: {character.xp}</p>
      </div>
    </li>
  );
}