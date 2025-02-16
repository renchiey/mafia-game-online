import { ReactNode } from "react";
import { IoCloseOutline } from "react-icons/io5";

interface ModalProps {
  show: boolean;
  closeModal?: () => void;
  children?: ReactNode;
}

export const Modal = ({ show, closeModal, children }: ModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center  ">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center relative">
        {children}
        <div
          className="absolute top-1 right-1 cursor-pointer"
          onClick={closeModal}
        >
          <IoCloseOutline size={28} className=" text-gray-700" />
        </div>
      </div>
      <div className=" absolute w-screen h-screen bg-black opacity-60 z-[-1] backdrop-blur-3xl"></div>
    </div>
  );
};
