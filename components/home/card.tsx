import { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import Balancer from "react-wrap-balancer";

export default function Card({
  title,
  description,
  demo,
  large,
}: {
  title: string;
  description: string;
  demo: ReactNode;
  large?: boolean;
}) {
  return (
    <div
      className={`relative col-span-1  overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-md ${
        large ? "h-fit md:col-span-2" : "h-96"
      }`}
    >
      <div
        className={`${
          large ? "h-64 md:h-96" : "h-48"
        } m-2 flex items-center justify-center`}
      >
        {demo}
      </div>
      <div className="mt-4 w-full text-center">
        <h2 className="my-4  ml-2 bg-gradient-to-br from-black to-stone-500 bg-clip-text text-left font-display text-xl font-bold text-transparent md:text-3xl md:font-normal">
          <Balancer>{title}</Balancer>
        </h2>
        <div className="prose-sm -mt-4 leading-normal text-gray-500 md:prose">
          <div className="m-2 flex text-left text-sm text-gray-500 md:text-lg">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}
