interface TextInputProps {
  setUsername: (name: string) => void;
}

export function TextInput({ setUsername }: TextInputProps) {
  return (
    <div className="p-4">
      <label className="block text-lg font-medium mb-2">Username:</label>
      <input
        type="text"
        onChange={(e) => setUsername(e.target.value)}
        className="border border-gray-300 rounded-lg p-2 w-[200px]"
        placeholder="Enter your username"
        maxLength={20}
      />
    </div>
  );
}
