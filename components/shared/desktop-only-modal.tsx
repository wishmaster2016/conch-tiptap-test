import React, { SetStateAction } from 'react'
import Modal from "@/components/shared/modal";
import Image from "next/image";
import Link from 'next/link';
import mixpanel from 'mixpanel-browser';

function DesktopOnlyModal({ showDesktopOnlyModal, setShowDesktopOnlyModal } : { showDesktopOnlyModal: boolean, setShowDesktopOnlyModal: React.Dispatch<SetStateAction<boolean>> }) {
  return (
    <Modal showModal={showDesktopOnlyModal} setShowModal={() => {}}>
      <div className="w-full  overflow-hidden shadow-xl md:max-w-md md:rounded-2xl md:border md:border-gray-200">
        <div className="flex h-96 bg-white flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center md:px-16">
          <Image
            src="/logo.png"
            alt="Logo"
            className="h-10 w-10 rounded-full"
            width={20}
            height={20}
          />
          <h3 className="font-display text-2xl font-bold">Please use Desktop or Tablet</h3>
          <div className="flex flex-row mb-8">
          <p className="text-lg text-gray-500">
            This functionality is not currently available on mobile.
          </p>
          </div>
          <div className="flex flex-row justify-start w-full ">
            <ul className='justify-start w-full px-6 mb-4'>
            <li className='flex items-center'>
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" fill="#936bff"></path> </svg>
          <p className='ml-2'>Access to AI rewriter</p>
          </li>
          <li className='flex items-center'>
         <svg  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" fill="#936bff"></path> </svg>
          <p className='ml-2'>Access to Chrome Extension</p>
          </li>
          <li className='flex items-center'>
         <svg  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" fill="#936bff"></path> </svg>
          <p className='ml-2'>Generate Essays</p>
          </li>
          <li className='flex items-center'>
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" fill="#936bff"></path> </svg>
          <p className='ml-2'>Summarize PDFs/articles/papers</p>
          </li>
          <li className='flex items-center'>
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" fill="#936bff"></path> </svg>
          <p className='ml-2'>Rewriter tool</p>
          </li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default DesktopOnlyModal;