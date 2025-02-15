import { IoCloseOutline } from "react-icons/io5";

interface DisconnectedModalProps {
  show: boolean;
  closeModal?: () => void;
}

export function DisconnectedModal({
  show,
  closeModal,
}: DisconnectedModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center  ">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center relative">
        <h2 className="text-lg font-semibold text-red-600">Disconnected</h2>
        <p className="text-gray-600 mt-2">
          You have lost connection to the server.
        </p>
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
}
