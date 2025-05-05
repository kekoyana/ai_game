import React from "react";

type RoleButtonsProps = {
  roles: string[];
  selectedRoles: string[];
  currentRole: string | null;
  turn: number;
  governor: number;
  onSelect: (role: string) => void;
};

const RoleButtons: React.FC<RoleButtonsProps> = ({
  roles,
  selectedRoles,
  currentRole,
  turn,
  governor,
  onSelect,
}) => (
  <div className="role-buttons">
    {roles.map((r) => (
      <button
        key={r}
        onClick={() => onSelect(r)}
        disabled={turn !== governor || !!currentRole || selectedRoles.includes(r)}
      >
        {r}
      </button>
    ))}
  </div>
);

export default RoleButtons;