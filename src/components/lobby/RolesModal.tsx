import { createPortal } from "react-dom";
import { HiOutlinePlus, HiOutlineX } from "react-icons/hi";
import { GameRole } from "../../utils/types";
import { Roles } from "../../utils/roles";

interface RolesModalProps {
  addCallback: (role: GameRole) => () => void;
  onClose: () => void;
}

export function RolesModal({ addCallback, onClose }: RolesModalProps) {
  return (
    <>
      {createPortal(
        <div className="role-modal-container">
          <h3>
            Add Role <HiOutlineX className="modal-close-icon" onClick={onClose} />
          </h3>
          <div className="role-modal-content">
            <h4 className="role-mafia">Mafia</h4>
            <ul>
              <li onClick={addCallback(Roles.mafia.mafioso)}>
                Mafioso
                <HiOutlinePlus className="role-add-icon" />
              </li>
            </ul>
          </div>
          <div className="role-modal-content">
            <h4 className="role-town">Town</h4>
            <ul>
              <li onClick={addCallback(Roles.towns.townie)}>
                Townie
                <HiOutlinePlus className="role-add-icon" />
              </li>
              <li onClick={addCallback(Roles.towns.investigator)}>
                Investigator
                <HiOutlinePlus className="role-add-icon" />
              </li>
              <li onClick={addCallback(Roles.towns.doctor)}>
                Doctor
                <HiOutlinePlus className="role-add-icon" />
              </li>
              <li onClick={addCallback(Roles.towns.veteran)}>
                Veteran
                <HiOutlinePlus className="role-add-icon" />
              </li>
              <li onClick={addCallback(Roles.towns.transporter)}>
                Transporter
                <HiOutlinePlus className="role-add-icon" />
              </li>
            </ul>
          </div>
          <div className="role-modal-content">
            <h4 className="role-neutral">Neutral</h4>
            <ul>
              <li onClick={addCallback(Roles.neutral.jester)}>
                Jester
                <HiOutlinePlus className="role-add-icon" />
              </li>
            </ul>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
