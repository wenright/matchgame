import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactElement, useState } from 'react'

import { X } from 'react-feather'

export default function Modal(props: {open: boolean, setOpen: (arg0: boolean) => void, title: string, body: ReactElement, buttonText?: string, buttonAction?: () => void}) {
  return (
    <>
      <Transition appear show={props.open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => props.setOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center text-stone-100 font-poppins">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl p-6 bg-stone-800 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg"
                  >
                    {props.title}
                  </Dialog.Title>
                  <button
                    className="absolute right-0 top-0 p-4"
                    onClick={() => props.setOpen(false)}
                    ><X /></button>
                  <div className="mt-2">
                    <p className="text-sm">
                      {props.body}
                    </p>
                  </div>

                  {props.buttonText && props.buttonAction &&
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={props.buttonAction}
                      >
                        {props.buttonText}
                      </button>
                    </div>
                  }
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
