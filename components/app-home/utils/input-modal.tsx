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

const InputModal = ({
  showDemoModal,
  setShowDemoModal,
  submitInput,
}: {
  showDemoModal: boolean;
  setShowDemoModal: Dispatch<SetStateAction<boolean>>;
  submitInput: (input: string) => void;
}) => {
  const [input, setInput] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleInputSubmit = (e: any) => {
    e.preventDefault();

    submitInput(input);
    setShowDemoModal(false);
  };

  return (
    <Modal showModal={showDemoModal} setShowModal={setShowDemoModal}>
      <div className="w-full overflow-hidden md:max-w-md md:rounded-2xl md:border md:border-gray-100 md:shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 bg-white px-4 py-6 pt-8 text-center md:px-16">
          <div className="mb-2 flex w-full justify-center font-semibold">
            Name:
          </div>
          <form
            className="flex flex-row items-center"
            onSubmit={(e) => handleInputSubmit(e)}
          >
            {/* TODO: on enter automatically submit too */}
            <input
              ref={inputRef}
              autoFocus
              onChange={(e) => setInput(e.target.value)}
              className="border border-r-0"
            />
            <button type="submit">
              <FaCheckSquare
                size={29}
                className="z-999 -ml-3 inline-block text-green-500"
              />
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export function useInputModal({
  submitInput,
}: {
  submitInput: (input: string) => void;
}) {
  const [showInputModal, setShowInputModal] = useState(false);

  const InputModalCallback = useCallback(() => {
    return (
      <InputModal
        showDemoModal={showInputModal}
        setShowDemoModal={setShowInputModal}
        submitInput={submitInput}
      />
    );
  }, [showInputModal, setShowInputModal]);

  return useMemo(
    () => ({
      showInputModal,
      setShowInputModal,
      InputModal: InputModalCallback,
    }),
    [setShowInputModal, InputModalCallback],
  );
}
