export const Switch: React.FC<{
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ id, checked, onChange }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`
      relative inline-flex h-5 w-9 items-center rounded-full
      transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
      ${checked ? 'bg-blue-600' : 'bg-gray-600'}
    `}
  >
    <span
      className={`
        inline-block h-4 w-4 transform rounded-full bg-white
        transition duration-200 ease-in-out
        ${checked ? 'translate-x-5' : 'translate-x-1'}
      `}
    />
  </button>
);