import { Dispatch, SetStateAction, ReactNode, useRef } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import useWindowSize from "@/lib/hooks/use-window-size";
import Leaflet from "../../shared/leaflet";

export default function AppPopover({
  children,
  content,
  align = "center",
  openPopover,
  setOpenPopover,
  className,
}: {
  children: ReactNode;
  content: ReactNode | string;
  align?: "center" | "start" | "end";
  openPopover: boolean;
  setOpenPopover: Dispatch<SetStateAction<boolean>>;
  className?: string;
}) {
  const { isMobile, isDesktop } = useWindowSize();
  return (
    <>
      {isMobile && children}
      {openPopover && isMobile && (
        <Leaflet setShow={setOpenPopover}>{content}</Leaflet>
      )}
      {isDesktop && (
        <PopoverPrimitive.Root>
          <PopoverPrimitive.Trigger className="inline-flex" asChild>
            {children}
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Content
            sideOffset={4}
            align={align}
            className={`${className} z-20 mr-3 animate-slide-up-fade rounded-md border border-gray-200 bg-white drop-shadow-lg`}
          >
            {content}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Root>
      )}
    </>
  );
}
