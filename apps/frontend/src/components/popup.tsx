import type { JSX } from "solid-js/jsx-runtime";
import PortalBody from "./portal-body";
import { onCleanup, onMount } from "solid-js";

export default function Popup(
  props: { onExit: () => void; children: JSX.Element },
) {
  let ref!: HTMLDivElement;

    const handleEvent = (e: MouseEvent) => {
    if (ref && !ref.contains(e.target as Node)) {
      props.onExit();
    }
  };

  onCleanup(() => {
    document.removeEventListener("mousedown", handleEvent);
    props.onExit();
  });

  onMount(() => {
    document.addEventListener("mousedown", handleEvent);
  });

  return (
    <PortalBody>
      <div class="fixed inset-0 flex h-screen w-full items-center justify-center bg-black bg-opacity-75">
        <div class="absolute flex justify-start w-full h-full">
          <button
            class="h-16 w-16  active:scale-95 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:hover:bg-slate-800 dark:hover:text-slate-100 disabled:opacity-50 dark:focus:ring-slate-400 disabled:pointer-events-none dark:focus:ring-offset-slate-900 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-slate-800 z-50 mt-3 text-2xl text-white drop-shadow-lg"
            onClick={() => props.onExit()}
          >
            X
          </button>
        </div>
        <div
          class="z-10 flex h-full  w-full flex-col items-center justify-centr opacity-100 sm:h-[45rem] sm:w-[40rem] overflow-y-auto"
          ref={ref}
        >
          <div class="p-5 flex h-full w-full flex-col items-center">
            {props.children}
          </div>
        </div>
      </div>
    </PortalBody>
  );
}
