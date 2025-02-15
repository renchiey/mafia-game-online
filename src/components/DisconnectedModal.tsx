interface DisconnectedModalProps {
  show: boolean;
}

export function DisconnectedModal({ show }: DisconnectedModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center  ">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center animate-fadeIn">
        <h2 className="text-lg font-semibold text-red-600">Disconnected</h2>
        <p className="text-gray-600 mt-2">
          You have lost connection to the server.
        </p>
      </div>
      <div className=" absolute w-screen h-screen bg-black opacity-60 z-[-1] backdrop-blur-3xl"></div>
    </div>
  );
}
