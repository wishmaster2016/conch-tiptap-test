import Modal from "@/components/shared/modal";
import {
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import Image from "next/image";
import { FaCheckSquare } from "react-icons/fa";

const ConfirmModal = ({
  showDemoModal,
  setShowDemoModal,
  handleConfirm,
}: {
  showDemoModal: boolean;
  setShowDemoModal: Dispatch<SetStateAction<boolean>>;
  handleConfirm: () => void;
}) => {
  const [input, setInput] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleConfirmClick = (e: any) => {
    e.preventDefault();

    handleConfirm();
    setShowDemoModal(false);
  };

  return (
    <Modal showModal={showDemoModal} setShowModal={setShowDemoModal}>
      <div className="w-full overflow-hidden md:max-w-md md:rounded-2xl md:border md:border-gray-100 md:shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 bg-white px-4 py-6 pt-8 text-center md:px-16">
          <p>Going to Enhancer will remove all formatting.</p>
          <form
            className="flex flex-row items-center"
            onSubmit={handleConfirmClick}
          >
            <button
              type="submit"
              className="mr-3 rounded-xl border px-2 py-1"
              onClick={() => {
                setShowDemoModal(false);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rewriteButton px-2 py-1 text-white"
            >
              Confirm
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export function useConfirmModal({
  handleConfirm,
}: {
  handleConfirm: () => void;
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const ConfirmModalCallback = useCallback(() => {
    return (
      <ConfirmModal
        showDemoModal={showConfirmModal}
        setShowDemoModal={setShowConfirmModal}
        handleConfirm={handleConfirm}
      />
    );
  }, [showConfirmModal, setShowConfirmModal]);

  return useMemo(
    () => ({
      showConfirmModal,
      setShowConfirmModal,
      ConfirmModal: ConfirmModalCallback,
    }),
    [setShowConfirmModal, ConfirmModalCallback],
  );
}
