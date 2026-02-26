"use client";

type Props = {
  user: any;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onOpen: (user: any) => void;
};

export default function UserRow({
  user,
  selected,
  onSelect,
  onOpen,
}: Props) {
  return (
    <tr
      className="border-b hover:bg-zinc-50 cursor-pointer"
      onClick={() => onOpen(user)}
    >
      {/* Checkbox */}
      <td className="p-2">
        <input
          type="checkbox"
          checked={selected}
          onClick={e => e.stopPropagation()}
          onChange={e =>
            onSelect(user._id, e.target.checked)
            
          }
        />
      </td>

      <td className="p-2">{user.email}</td>

      <td className="p-2 text-center">
        {user.wallet?.balanceATC ?? 0}
      </td>

      <td className="p-2 text-center">
        {user.wallet?.totalMinutes ?? 0}
      </td>

      <td className="p-2 text-center">
        {user.kycStatus}
      </td>

      <td className="p-2 text-center">
        {user.trustScore}
      </td>

      <td className="p-2 text-center">
        {user.isPaused ? (
          <span className="text-red-600">Paused</span>
        ) : (
          <span className="text-green-600">Active</span>
        )}
      </td>
    </tr>
  );
}